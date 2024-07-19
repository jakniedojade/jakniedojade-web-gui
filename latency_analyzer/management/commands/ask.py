import datetime
import questionary

from django.core.management.base import BaseCommand
from django.utils import timezone
from latency_analyzer.models import Stop, Route, Trip, Latency
from questionary import Style
from latency_analyzer.lib.helpers import calculate_averages, convert_delta_to_str


class Command(BaseCommand):
    """!
    @brief This command is used to get information about the average latency of a bus line between two stops in a
    given time interval.
    """

    help = 'Get ZTM bus latency archive information'

    custom_style = Style([
        ('qmark', 'fg:#ff9f1c bold'),
        ('question', 'fg:#f1c40f bold'),
        ('answer', 'fg:#e74c3c bold'),
        ('pointer', 'fg:#2ecc71 bold'),
        ('highlighted', 'fg:#ecf0f1 bg:#2980b9 bold'),
        ('selected', 'fg:#ffffff bg:#8e44ad'),
        ('separator', 'fg:#7f8c8d'),
        ('instruction', 'fg:#f1c40f'),
        ('text', 'fg:#ecf0f1'),
        ('disabled', 'fg:#95a5a6 italic')
    ])

    def __init__(self, *args, **kwargs):
        """!
        @brief Initialize the command
        """

        super().__init__(*args, **kwargs)
        self.start_stop = None
        self.start_datetime = None
        self.end_stop = None
        self.end_datetime = None
        self.route = None

    def handle(self, *args: str, **kwargs: str) -> None:
        """!
        @brief Run the command
        """

        self.start_stop = self.ask_start_stop()
        self.route = self.ask_route(self.start_stop)
        self.end_stop = self.ask_end_stop()
        self.start_datetime = self.ask_date(False)
        self.end_datetime = self.ask_date(True)
        self.display_differences()

    def ask_start_stop(self) -> Stop:
        """!
        @brief Ask the user to select a departure stop

        @return A Stop object
        """

        stop_list = Stop.objects.values_list('name', flat=True).distinct()

        stop_name = None
        while True:
            stop_name = questionary.autocomplete("Enter a departure stop name:", choices=stop_list, style=self.custom_style).ask()

            if stop_name not in stop_list:
                self.stdout.write(self.style.ERROR('Stop name not found. Please try again.'))
                continue

            break

        stop = Stop.objects.get(name=stop_name)
        return stop

    def ask_route(self, stop: Stop) -> Route:
        """!
        @brief Ask the user to select a bus line that goes through the selected departure stop

        @param stop A Stop object
        @return A Route object
        """

        routes_list = Route.objects.filter(trip__stoptime__stop=stop).values_list('route_short_name', flat=True).distinct()

        bus_line = questionary.select("Select a bus line:", choices=list(routes_list), style=self.custom_style).ask()

        route = Route.objects.get(route_short_name=bus_line)
        return route

    def ask_end_stop(self) -> Stop:
        """!
        @brief Ask the user to select an arrival stop

        @return A Stop object
        """

        trips = Trip.objects.filter(route=self.route, stoptime__stop=self.start_stop)
        trip = trips.first()

        is_one_way = trips.values_list('direction', flat=True).distinct().count() != 2

        if is_one_way:
            stop_sequence = trip.stoptime_set.filter(stop=self.start_stop).first().stop_sequence
            stop_list = trip.stoptime_set.filter(stop_sequence__gt=stop_sequence).values_list('stop__name', flat=True)
        else:
            stop_list = trip.stoptime_set.all().values_list('stop__name', flat=True)

        end_stop = questionary.select("Select an arrival stop:", choices=stop_list, style=self.custom_style).ask()

        stop = Stop.objects.get(name=end_stop)
        return stop

    def ask_date(self, end_mode: bool) -> datetime:
        """!
        @brief Ask the user to select a date and time

        @param mode A 
        @return A datetime object
        """

        while True:
            try:
                date_str = questionary.text(f"Enter a {'end monitoring' if end_mode else 'start monitoring'} date and time (YYYY-MM-DD HH:MM):", style=self.custom_style).ask()
                naive_datetime = datetime.datetime.strptime(date_str, '%Y-%m-%d %H:%M')
                aware_datetime = timezone.make_aware(naive_datetime)
                break

            except ValueError:
                self.stdout.write(self.style.ERROR('Invalid date and time format. Please try again.'))

        return aware_datetime

    def display_differences(self) -> None:
        """!
        @brief Calculate the average latency, trimmed mean and median between two stops in a given time interval

        @param start_latencies A list of latencies for the start stop
        @param end_latencies A list of latencies for the end stop
        @param journey_times A list of journey times
        """

        trips = Trip.between_stops(self.route, self.start_datetime, self.end_datetime, self.start_stop, self.end_stop)
        differences = Latency.between_stops(trips, self.start_stop, self.end_stop)

        count, avg_time, avg_latency, median_latency, trimmed_latency = calculate_averages(differences)

        if count == 0:
            self.stdout.write(self.style.ERROR('Latency data not available for the selected stops.'))
            return

        self.stdout.write(self.style.SUCCESS("-" * 75))
        self.stdout.write(self.style.SUCCESS(f'Number of trips: {count}'))
        self.stdout.write(self.style.SUCCESS(f"Average trip time: {convert_delta_to_str(avg_time)}"))
        self.stdout.write(self.style.SUCCESS("-" * 75))
        self.stdout.write(self.style.SUCCESS(f'Average latency: {convert_delta_to_str(avg_latency)}'))
        self.stdout.write(self.style.SUCCESS(f'Median latency: {convert_delta_to_str(median_latency)}'))
        self.stdout.write(self.style.SUCCESS(f'Trimmed latency: {convert_delta_to_str(trimmed_latency)}'))
        self.stdout.write(self.style.SUCCESS("-" * 75))
