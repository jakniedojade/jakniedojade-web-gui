import zipfile
import os
from pathlib import Path
from datetime import datetime

from latency_analyzer.management.commands import scrap_api
from latency_analyzer.models import Route, Stop, Trip, StopTime, Shape

from latency_analyzer.lib.scrap.reader import Reader


class Command(scrap_api.Command):
    """!
    @brief A Django management command to load a group of archived files.
    """
    help = "Load archive gtfs and positions"

    def __init__(self, *args, **kwargs):
        """!
        @brief Initialize the command.
        """

        self.reader = Reader(Path(), "", 11)
        super().__init__(self, *args, **kwargs)

        self.date_format = '%Y-%m-%d_%H-%M-%S'
        self.pos_path = None
        self.gtfs_path = None

    def add_arguments(self, parser) -> None:
        """!
        @brief Add command line arguments for the script.
        """

        parser.add_argument('-p', '--pos-path', help='Path to directory with position json files', required=True)
        parser.add_argument('-g', '--gtfs-path', help='Path to directory with gtfs files', required=True)
        parser.add_argument('-s', '--shapes-path', help='Path to directory with shape and trip files to connect and load as a last step. The shapes have to be generated from the last loaded gtfs file')
        parser.add_argument('-d', '--delete-gtfs', action="store_true", help='Remove all gtfs data before loading')

    def handle(self, *args, **options) -> None:
        """!
        @brief Main handler for the command, manages the loading processes.
        """
        self.pos_path = Path(options['pos_path'])
        self.gtfs_path = Path(options['gtfs_path'])
        self.delete_gtfs() if options['delete_gtfs'] else None

        self.load()
        print("Finished loading archived files")

        if options['shapes_path']:
            self.shapes_path = Path(options['shapes_path'])
            self.load_shapes()
            print("Finished loading shapes")


    def load(self) -> None:
        """!
        @brief Sorts the gtfs files by date and for each bundle loads it's positions.
        """
        gtfs_files = sorted(self.gtfs_path.glob('*.zip'))
        for i in range(len(gtfs_files) - 1):
            start_gtfs_filename_without_extention = gtfs_files[i].stem
            start_gtfs_date = datetime.strptime(start_gtfs_filename_without_extention, self.date_format)
            self.load_gtfs(gtfs_files[i])

            finish_gtfs_filename_without_extention = gtfs_files[i+1].stem
            finish_gtfs_date = datetime.strptime(finish_gtfs_filename_without_extention, self.date_format)

            self.load_positions(start_gtfs_date, finish_gtfs_date)

        last_gtfs_filename_without_extention = gtfs_files[-1].stem
        last_gtfs_date = datetime.strptime(last_gtfs_filename_without_extention, self.date_format)
        self.load_gtfs(gtfs_files[-1])
        self.load_positions(last_gtfs_date, datetime.now())

    def load_positions(self, start_date : datetime, finish_date : datetime) -> None:
        """!
        @brief Loads positions from the given time range

        @param start_date A datetime object with the start date.
        @param finish_date A datetime object with the finish date.
        """
        # TODO
        # Mark loaded files somehow, or better rember their filenames so we don't have to sort every position file for each
        # gtfs boundle
        # The positions file list could just be a class variable list and we could iterate over it with an index for example
        files = sorted(self.pos_path.glob('*.json'))
        print(f"Loading positions from: {start_date} to: {finish_date}")
        counter = 0
        for file in files:
            filename_without_extention = file.stem
            file_date = datetime.strptime(filename_without_extention, self.date_format)
            if start_date <= file_date and file_date < finish_date:
                self.reader.positions = file
                # TODO
                # Disable output of reader to stdout. You can't actually see anything there what's happening
                self.reader.read()
                counter += 1
        print(f"Loaded {counter} positions")

    def load_gtfs(self, path : Path) -> None:
        """!
        @brief Loads gtfs from the given path.
        """
        gtfs_directory = path.parent

        print(f"Loading GTFS: {path}")
        with zipfile.ZipFile(path, 'r') as zip_ref:
            zip_ref.extractall(gtfs_directory)

        Route.load_routes(gtfs_directory / "routes.txt")
        Stop.load_stops(gtfs_directory / "stops.txt")
        Trip.load_trips(gtfs_directory / "trips.txt")
        StopTime.load_stoptimes(gtfs_directory / "stop_times.txt")
        Shape.load_shapes(gtfs_directory / "shapes.txt")

        # TODO
        # Don't blindly delete all .txt files, they should probably be first extracted to a new directory
        # then loaded and deleted to not accidentally delete user's .txt files in the parent directory of gtfs archive path
        unpacked_files = sorted(gtfs_directory.glob('*.txt'))
        for file in unpacked_files:
            os.remove(file)

    def load_shapes(self):
        """!
        @brief Loads only shapes from the given path.
        """
        Shape.load_shapes(self.shapes_path / "shapes.txt")
        Trip.load_trips(self.shapes_path / "trips.txt")


    @staticmethod
    def delete_gtfs() -> None:
        """!
        @brief Deletes all gtfs data from the database.
        """
        StopTime.objects.all().delete()
        Trip.objects.all().delete()
        Stop.objects.all().delete()
        Route.objects.all().delete()
        Shape.objects.all().delete()
        print("All gtfs data deleted")
