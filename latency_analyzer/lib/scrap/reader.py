import decimal
import random
from datetime import timedelta, datetime
import geopy.distance
import pytz
import os
from pathlib import Path
from time import sleep

import ijson
from django.db import transaction
from django.db.models import Case, When, QuerySet

from latency_analyzer.lib.helpers import iid, validate_trip_id
from latency_analyzer.models import Trip, Route, Latency, Stop, StopTime
from django.utils import timezone

from typing import Optional, List

from latency_analyzer.lib.scrap.downloader import download_positions, download_gtfs, download_brigades

from project_config.settings import GTFS_DIR, TIME_ZONE

class Reader():
    """!
    Scraper class for downloading new data, reading and analyzing it and saving it in a database
    at the same time.

    @see latency_analyzer/lib/scrap/scraper.py
    """

    def __init__(self, GTFS_DIR: Path, key: str, interval: int):
        """!
        @param GTFS_DIR The path to the GTFS_DIR directory.
        @param key API key for the ZTM API
        @param interval The interval between positions downloads.
        """

        self.GTFS_DIR = GTFS_DIR

        self.data_rt: Path = GTFS_DIR / "data_rt"
        self.brigades: Path = GTFS_DIR / self.data_rt / "brigades.json"
        self.positions: Path = GTFS_DIR / self.data_rt / "positions.json"
        self.gtfs_archive: Path = GTFS_DIR / "gtfs.zip"

        self.key = key
        self.interval = interval

        self.next_gtfs_run_time = datetime.now() + timedelta(hours=4)
        self.next_pos_run_time = datetime.now()

    def run(self) -> None:
        """!
        @brief Run the main loop.
        """

        if not self.positions.exists():
            try:
                download_positions(self.key, self.data_rt, self.brigades)
                if not self.positions.exists():
                    raise FileNotFoundError("Failed to download positions.json")
            except Exception as e:
                print(f"An error occurred: {e}")
                return
        self.main_loop()

    
    def main_loop(self) -> None:
        """!
        @brief Main loop that downloads the timetable and brigades files and then continuously scrapes the positions.
        """

        while True:
            if datetime.now() >= self.next_gtfs_run_time:
                self.load_timetable()
            if datetime.now() >= self.next_pos_run_time:
                self.next_pos_run_time = datetime.now() + timedelta(seconds=self.interval)
                self.scrap_read()
                print(f"{datetime.now()} Next gtfs/brigades run time: {self.next_gtfs_run_time}, "
                      f"Left: {self.next_gtfs_run_time - datetime.now()}, Next pos run time: {self.next_pos_run_time}, "
                      f"Left: {self.next_pos_run_time - datetime.now()}")
            else:
                total_seconds = max(0,(self.next_pos_run_time - datetime.now()).total_seconds())
                print(f"Sleeping for {round(total_seconds, 2)} seconds")
                sleep((self.next_pos_run_time - datetime.now()).total_seconds())

    def load_timetable(self, block: bool = False) -> None:
        """!
        @brief Load gtfs timetable and brigades files.

        @param block If True, the function will block until the timetable is loaded.
        """
        try:
            # The 3 scrap_reads are temporary and supposed to minimize holes in data while
            # downloading brigades and gtfs files

            self.try_scrap_read(block=block)

            download_gtfs()
            download_brigades(self.key, block=block)

            self.try_scrap_read(block=block)

            Route.load_routes()
            Stop.load_stops()
            Trip.load_trips()
            StopTime.load_stoptimes()

            self.try_scrap_read(block=block)

            next_run_delta = timedelta(hours=random.uniform(3, 8))
            self.next_gtfs_run_time = datetime.now() + next_run_delta

        except Exception as e:
            print(f"An error occurred while loading timetable: {e}")
            if self.brigades.exists():
                self.brigades.unlink()
                print("Brigades file deleted.")
            exit(1)

    def try_scrap_read(self, block: bool = False) -> None:
        """!
        @brief Attempt to perform scraping and reading, controlled by the 'block' parameter.

        @param block If True, the function will block until the scraping and reading is finished.
        """

        if not block:
            self.scrap_read()

    def scrap_read(self) -> None:
        """!
        @brief Perform both scraping and reading operations.
        """

        download_positions(self.key, self.data_rt, self.brigades)

        self.read()

    @transaction.atomic
    def read(self) -> None:
        """!
        @brief Read and process scraped data.
        """

        print(f"{datetime.now()} Reading {self.positions.name}")

        with open(self.positions, 'rb') as file:
            trip_ids = {iid(position['trip_id']) for position in ijson.items(file, 'positions.item')}
            trips = {trip.id: trip for trip in Trip.objects.filter(id__in=trip_ids).distinct()}

            bulk_latencies_create = []
            
            file.seek(os.SEEK_SET)

            for position in ijson.items(file, 'positions.item'):
                if not validate_trip_id(position['trip_id']):
                    continue

                trip = trips.get(iid(position['trip_id']))
                timestamp = datetime.strptime(position['timestamp'], '%Y-%m-%dT%H:%M:%S%z')

                nearest_stop = self.find_nearest_stop(trip, position["lat"], position["lon"])

                if nearest_stop:
                    last_latency = self.find_last_latency(trip, timestamp)
                    if last_latency:
                        missed_stops = self.find_missed_stops(last_latency.stop, nearest_stop, trip)
                        self.save_missed_stops(missed_stops, last_latency, trip, timestamp)

                    time_24_hours_ago = timestamp - timedelta(hours=20)
                    exists = Latency.objects.filter(stop=nearest_stop, trip=trip,
                                                    timestamp__gte=time_24_hours_ago).exists()

                    if not exists:
                        bulk_latencies_create.append(Latency(
                                stop=nearest_stop,
                                trip=trip,
                                timestamp=timestamp,
                                latency=self.calculate_latency(trip, nearest_stop, timestamp),
                            ))

            if bulk_latencies_create:
                Latency.objects.bulk_create(bulk_latencies_create)
                
        print(f"{datetime.now()} Reading {self.positions.name} Done")

    def find_missed_stops(self, from_stop: Stop, to_stop: Stop, trip: Trip) -> QuerySet[Stop]:
        """!
        @brief Identify stops that were missed between two specified stops.

        @param from_stop The first stop.
        @param to_stop The last stop.
        @param trip The trip that the stops are on.
        @return A QuerySet of stops that were missed.
        """

        stop_sequences = {stoptime.stop.id: stoptime.stop_sequence for stoptime in
                          StopTime.objects.filter(trip=trip).prefetch_related('stop')}

        from_stop_sequence = self.get_stop_sequence(from_stop, trip)
        to_stop_sequence = self.get_stop_sequence(to_stop, trip)

        if from_stop_sequence + 1 == to_stop_sequence:
            return []

        missed_stop_ids = [
            stop_id for sequence, stop_id in sorted(
                (sequence, stop_id) for stop_id, sequence in stop_sequences.items()
                if from_stop_sequence < sequence < to_stop_sequence
            )
        ]

        preserved_order = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(missed_stop_ids)])
        return Stop.objects.filter(id__in=missed_stop_ids).order_by(preserved_order)

    @transaction.atomic
    def save_missed_stops(self, missed_stops: List[Stop], last_latency: Latency, trip: Trip, timestamp: datetime) -> None:
        """!
        @brief Save data about missed stops to the database. Estimate the time of arrival at each stop.

        @param missed_stops A list of missed stops.
        @param last_latency The last latency record.
        @param trip The trip that the stops are on.
        @param timestamp The timestamp of the current position.
        """

        delta = (timestamp - last_latency.timestamp)
        missed_stops_count = len(missed_stops)

        if missed_stops_count:
            print("--------------------------------------------------")
            print(f"DELTA: {round(delta.total_seconds() / 60, 2)} MIN")
            print(f"COUNT: {missed_stops_count}")
            print(f"ROUTE: {trip.route.route_short_name}")
            print(f"MISSED STOPS: {missed_stops}")
            print(f"--------------------------------------------------")

        new_latencies = []
        for e, missed_stop in enumerate(missed_stops, start=1):
            estimated_timestamp = last_latency.timestamp + delta * (e / (missed_stops_count + 1))
            new_latency = Latency(
                stop=missed_stop,
                trip=trip,
                timestamp=estimated_timestamp,
                latency=self.calculate_latency(trip, missed_stop, estimated_timestamp),
            )
            new_latencies.append(new_latency)

        Latency.objects.bulk_create(new_latencies)

    def calculate_latency(self, trip: Trip, stop: Stop, timestamp: datetime) -> timedelta:
        """!
        @brief Calculate the latency between the predicted and actual arrival times.

        @param trip The trip that the stop is on.
        @param stop The stop.
        @param timestamp The timestamp of the current position.
        @return The latency.
        """

        real_arrival = timestamp.astimezone(pytz.timezone(TIME_ZONE))

        arrival_time_obj = StopTime.objects.filter(trip=trip, stop=stop).first().arrival_time
        predicted_arrival_time = timezone.make_aware(datetime.combine(datetime.min, arrival_time_obj))
        predicted_arrival = predicted_arrival_time.replace(year=real_arrival.year,
                                                           month=real_arrival.month,
                                                           day=real_arrival.day)
        delta = real_arrival - predicted_arrival

        if not self.get_stop_sequence(stop, trip) and delta < timedelta(seconds=0):
            return timedelta(minutes=0)

        if abs(delta) > timedelta(hours=12):
            last_latency = self.find_last_latency(trip, timestamp)
            return last_latency.latency if last_latency else timedelta(minutes=0)

        print(f"ROUTE: {trip.route.route_short_name} | STOP: {stop} | PREDICTED: {predicted_arrival} | "
              f"REAL: {real_arrival} | RETURN DELTA (MIN): {round(delta.total_seconds() / 60, 2)}")

        return delta

    @staticmethod
    def get_stop_sequence(stop: Stop, trip: Trip) -> Optional[int]:
        """!
        @brief Get the sequence number of a stop for a given trip.

        @param stop The stop.
        @param trip The trip.
        @return The stop sequence number.
        """

        return StopTime.objects.filter(stop=stop, trip=trip).values_list('stop_sequence', flat=True).first()

    @staticmethod
    def find_last_latency(trip: Trip, timestamp: datetime) -> Optional[Latency]:
        """!
        @brief Find the most recent latency record for a current trip.

        @param trip The trip.
        @param timestamp The timestamp of the current position.
        @return The most recent latency record.
        """

        three_hours_ago = timestamp - timedelta(hours=3)
        return Latency.objects.filter(
            trip=trip,
            timestamp__lt=timestamp,
            timestamp__gt=three_hours_ago
        ).order_by('-timestamp').first()

    @staticmethod
    def find_nearest_stop(trip: Trip, latitude: float, longitude: float) -> Optional[Stop]:
        """!
        @brief Find the nearest stop to a given latitude and longitude.

        The rough distance in degrees is about 200 meters radius to filter out stops that are too far away.

        @param trip The trip.
        @param latitude The latitude.
        @param longitude The longitude.
        @return The nearest stop.
        """

        rough_distance = decimal.Decimal(0.0020)

        lat_range = (latitude - rough_distance, latitude + rough_distance)
        lon_range = (longitude - rough_distance, longitude + rough_distance)

        stops = Stop.objects.filter(
            stoptime__trip=trip,
            latitude__range=lat_range,
            longitude__range=lon_range
        ).distinct()

        for stop in stops:
            distance = geopy.distance.distance((latitude, longitude),
                                               (stop.latitude, stop.longitude)).meters
            if distance <= 30:
                return stop
        return None
