from pathlib import Path

from django.core.management.base import BaseCommand


from latency_analyzer.lib.scrap.downloader import download_brigades, download_gtfs
from latency_analyzer.models import Route, Stop, Trip, StopTime, Shape


class Command(BaseCommand):
    """!
    @brief A helper Django command to load specific gtfs files.
    """

    help = "load data from gtfs files"

    def __init__(self):
        """
        Initialize the command.
        """
        super().__init__()

    def add_arguments(self, parser):
        """!
        @brief Add command line arguments for the script.
        """
        parser.add_argument('-k', '--kill', action="store_true", help='remove all data')
        parser.add_argument('-d', '--download', action="store_true", help='download new gtfs files')
        parser.add_argument('-a', '--all', action="store_true", help='load all data')
        parser.add_argument('-r', '--routes', action="store_true", help='load routes')
        parser.add_argument('-s', '--stops', action="store_true", help='load stops')
        parser.add_argument('-S', '--shapes', action="store_true", help='load shapes')
        parser.add_argument('-t', '--trips', action="store_true", help='load trips')
        parser.add_argument('-p', '--stoptimes', action="store_true", help='load stoptimes')
        parser.add_argument('-m', '--merge', action="store_true", help='merge stops and routes')
        parser.add_argument('-b', '--brigades', action="store_true", help='download brigades files')
        parser.add_argument('-K', '--key', help='api key for api.um.warszawa.pl', required=True)
        parser.add_argument('-F', '--shapes-from-file', default='archive_shapes', help='load shapes from specified files')

    def handle(self, *args, **kwargs):
        """!
        @brief Run chosen operations.
        """
        Command.delete_all() if kwargs['kill'] else None

        download_gtfs() if kwargs['download'] else None
        download_brigades(kwargs['key'], block=True) if kwargs['brigades'] else None

        Command.load_all() if kwargs['all'] else None
        Route.load_routes() if kwargs['routes'] and not kwargs['all'] else None
        Stop.load_stops() if kwargs['stops'] and not kwargs['all'] else None
        Trip.load_trips() if kwargs['trips'] and not kwargs['all'] else None
        StopTime.load_stoptimes() if kwargs['stoptimes'] and not kwargs['all'] else None
        Shape.load_shapes() if kwargs['shapes'] and not kwargs['all'] else None
        if kwargs['shapes_from_file'] and not kwargs['all']:
            Shape.load_shapes(Path(kwargs['shapes_from_file']) / "shapes.txt")
            Trip.load_trips(Path(kwargs['shapes_from_file']) / "trips.txt")

    @staticmethod
    def load_all():
        """!
        @brief Load all data from gtfs files.
        """
        print("\nLoading all data")

        Route.load_routes()
        Stop.load_stops()
        Trip.load_trips()
        StopTime.load_stoptimes()
        Shape.load_shapes()
        if kwargs['shapes']:
            Shape.load_shapes(Path(kwargs['shapes_from_file']) / "shapes.txt")
            Trip.load_trips(Path(kwargs['shapes_from_file']) / "trips.txt")

    @staticmethod
    def delete_all():
        """!
        @brief Delete all data currently in the database.
        """
        print("\nDeleting all data")
        StopTime.objects.all().delete()
        Trip.objects.all().delete()
        Stop.objects.all().delete()
        Route.objects.all().delete()
        Shape.objects.all().delete()
