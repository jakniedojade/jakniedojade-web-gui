"""
This file contains models used to represent data in the database.
"""

from django.db import models
from django.db.models import Subquery
import csv
from django.db import transaction
from latency_analyzer.lib.helpers import iid, time_validator, validate_trip_id, get_stop_name, stop_is_on_demand
from project_config.settings import GTFS_DIR


class Route(models.Model):
    """!
    @brief A model representing a route.

    A route is a group of trips that are displayed to passengers as a single service.
    For us it's basically a bus line.
    """
    id = models.BigIntegerField(primary_key=True)
    route_short_name = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return f"{self.route_short_name}"

    @staticmethod
    @transaction.atomic
    def load_routes(csv_path = GTFS_DIR / "data_gtfs" / "routes.txt") -> None:
        """!
        @brief Loads routes from a gtfs routes.txt CSV file into the database.
        """
        
        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            new_routes = []
            updated_routes = []
            existing_routes = Route.objects.in_bulk(field_name='id')

            for row in reader:
                if not validate_trip_id(row['route_id']):
                    continue

                route_id = iid(row['route_id'])

                if route_id in existing_routes:
                    existing_route = existing_routes[route_id]
                    existing_route.route_short_name = row['route_short_name']
                    updated_routes.append(existing_route)
                else:
                    new_route = Route(
                        id=route_id,
                        route_short_name=row['route_short_name']
                    )
                    new_routes.append(new_route)

        Route.objects.bulk_create(new_routes)
        Route.objects.bulk_update(updated_routes, ['route_short_name'])

        print("Routes loaded")

class Stop(models.Model):
    """!
    @brief A model representing a stop.

    A stop is a location where a vehicle stops to pick up or drop off passengers.
    """
    id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=200)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.name}"

    @staticmethod
    @transaction.atomic
    def load_stops(csv_path = GTFS_DIR / "data_gtfs" / "stops.txt") -> None:
        """!
        @brief Loads stops from a gtfs stops.txt CSV file into the database.
        """

        existing_stops = {stop.id: stop for stop in Stop.objects.all()}
        existing_names = set()

        new_stops = []
        updated_stops = []

        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                stop_id = iid(row['stop_id'])
                name = get_stop_name(row['stop_name'], existing_names)

                if stop_id in existing_stops:
                    stop = existing_stops[stop_id]
                    stop.name = name
                    stop.latitude = row['stop_lat']
                    stop.longitude = row['stop_lon']
                    updated_stops.append(stop)

                else:
                    new_stops.append(Stop(
                        id=stop_id,
                        name=name,
                        latitude=row['stop_lat'],
                        longitude=row['stop_lon']
                    ))

        Stop.objects.bulk_update(updated_stops, ['name', 'latitude', 'longitude'])
        Stop.objects.bulk_create(new_stops)

        print("Stops loaded")

class Latency(models.Model):
    """!
    @brief A model representing a latency.

    A latency is a time between a bus arriving at a stop and the time it was supposed to arrive.
    It can be negative if the bus arrived earlier than it was supposed to.
    """
    stop = models.ForeignKey('Stop', on_delete=models.CASCADE)
    trip = models.ForeignKey('Trip', on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    latency = models.DurationField()

    def __str__(self):
        return f"{self.stop.name} {self.trip.id} {self.latency.total_seconds()}"

    class Difference:
        def __init__(self, latency, time):
            self.latency = latency
            self.time = time

    @staticmethod
    def between_stops(trips, start_stop, end_stop):
        start_latencies = Latency.objects.filter(trip__in=trips, stop=start_stop).values_list('latency', 'timestamp')
        end_latencies = Latency.objects.filter(trip__in=trips, stop=end_stop).values_list('latency', 'timestamp')

        diffs = [Latency.Difference(end_latency - start_latency, end_time - start_time) for (start_latency, start_time), (end_latency, end_time) in zip(start_latencies, end_latencies)]
        return diffs

class Trip(models.Model):
    """!
    @brief A model representing a trip.

    A trip is a sequence of two or more stops that occurs at specific time.
    """
    id = models.BigIntegerField(primary_key=True)
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    direction = models.BooleanField()
    direction_headsign = models.CharField(max_length=200, null=True, blank=True)
    # TODO
    # This should probably be done with Django ORM realtions (specifically ManyToManyField,
    # because a trip can have multiple shape points and each shape point can be used by multiple trips)
    # but I couldn't get it to work. Currently there is just a method that makes a query and
    # returns a queryset of shapes for a given trip.
    # It's ugly but when trying to do it using ManyToManyField or ForeignKey, the load times were
    # unacceptable.
    shape_id = models.BigIntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.id} {self.route_id} {self.direction} {self.direction_headsign}"

    @staticmethod
    @transaction.atomic
    def load_trips(csv_path = GTFS_DIR / "data_gtfs" / "trips.txt") -> None:
        """!
        @brief Loads trips from a gtfs trips.txt CSV file into the database.
        """

        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            existing_trip_ids = set(Trip.objects.values_list('id', flat=True))
            new_trips = []
            updated_trips = []

            for row in reader:
                if not validate_trip_id(row['trip_id']):
                    continue

                trip_id = iid(row['trip_id'])

                if trip_id in existing_trip_ids:
                    updated_trips.append(Trip(
                        id=trip_id,
                        route_id=iid(row['route_id']),
                        direction=row['direction_id'],
                        direction_headsign=row['trip_headsign'],
                        shape_id=iid(row['shape_id'])
                    ))
                else:
                    new_trips.append(Trip(
                        id=trip_id,
                        route_id=iid(row['route_id']),
                        direction=row['direction_id'],
                        direction_headsign=row['trip_headsign'],
                        shape_id=iid(row['shape_id'])
                    ))
                
        Trip.objects.bulk_create(new_trips)
        Trip.objects.bulk_update(updated_trips, ['route_id', 'direction', 'direction_headsign', 'shape_id'])
            
        print("Trips loaded")

    def get_shapes(self):
        return Shape.objects.filter(shape_id=self.shape_id).order_by('point_sequency_number')

    @staticmethod
    def between_stops(route, start_datetime, end_datetime, start_stop, end_stop):
        return Trip.objects.filter(route=route,
                                    latency__timestamp__gte=start_datetime,
                                    latency__timestamp__lte=end_datetime,
                                    latency__stop=start_stop,
                                    id__in=Subquery(Trip.objects.filter(route=route,
                                                                      latency__timestamp__gte=start_datetime,
                                                                      latency__timestamp__lte=end_datetime,
                                                                      latency__stop=end_stop).values('id'))
                                    ).distinct()

class StopTime(models.Model):
    """!
    @brief A model representing a stop time.

    A stop time is the time that a vehicle arrives at and departs from a specific stop.
    It also conatins information about the sequence of stops for a given trip and whether
    the stop is on-demand.
    """
    stop_sequence = models.IntegerField(null=True, blank=True)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE)
    arrival_time = models.TimeField()
    on_demand = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.id} {self.trip_id} {self.stop_id} {self.arrival_time} {self.on_demand}"

    @staticmethod
    def load_stoptimes(csv_path = GTFS_DIR / "data_gtfs" / "stop_times.txt") -> None:
        """!
        @brief Loads stop times from a gtfs stop_times.txt CSV file into the database.
        """

        StopTime.objects.all().delete()

        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            new_stoptimes = []

            for row in reader:
                if not validate_trip_id(row['trip_id']):
                    continue

                trip_id = iid(row['trip_id'])
                stop_id = iid(row['stop_id'])
                arrival_time = time_validator(row['arrival_time'])
                on_demand = stop_is_on_demand(row['drop_off_type']) # pickup_type should be the same value for on-demand stops

                new_stoptimes.append(StopTime(
                    trip_id=trip_id,
                    stop_id=stop_id,
                    arrival_time=arrival_time,
                    stop_sequence=row['stop_sequence'],
                    on_demand=on_demand
                ))

            StopTime.objects.bulk_create(new_stoptimes)

        print("Stoptimes loaded")

class Shape(models.Model):
    """!
    @brief A model representing a shape.

    A shape is a sequence of points that form a line.
    It's connected to a trip with a many-to-one relationship.
    """
    shape_id = models.BigIntegerField()
    point_sequency_number = models.IntegerField()
    distance_traveled = models.FloatField()
    point_latitude = models.FloatField()
    point_longitude = models.FloatField()

    def __str__(self):
        return f"{self.shape_id} {self.point_sequency_number} {self.distance_traveled} {self.point_latitude} {self.point_longitude}"

    @staticmethod
    def load_shapes(csv_path = GTFS_DIR / "data_gtfs" / "shapes.txt") -> None:
        """!
        @brief Loads shapes from a gtfs shapes.txt CSV file into the database.
        """

        if not csv_path.is_file():
            print("Shapes file not found. Skipping loading of shapes.")
            return

        Shape.objects.all().delete()

        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)

            new_shapes = []

            for row in reader:
                new_shapes.append(Shape(
                    shape_id=iid(row['shape_id']),
                    point_sequency_number=row['shape_pt_sequence'],
                    distance_traveled=row['shape_dist_traveled'],
                    point_latitude=row['shape_pt_lat'],
                    point_longitude=row['shape_pt_lon']
                ))

            Shape.objects.bulk_create(new_shapes)

        print("Shapes loaded")

