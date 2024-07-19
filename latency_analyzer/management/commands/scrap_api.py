import os
import signal
import sys
from pathlib import Path

from latency_analyzer.lib.scrap.scraper import Scraper

from django.core.management.base import BaseCommand
from project_config.settings import GTFS_DIR

class Command(BaseCommand):
    """!
    @brief A Django management command to scrape and process bus location data from ZTM API.
    """

    help = "Scrap ztm bus location api"

    data_rt: Path = GTFS_DIR / "data_rt"
    brigades: Path = GTFS_DIR / data_rt / "brigades.json"
    positions: Path = GTFS_DIR / data_rt / "positions.json"
    gtfs_archive: Path = GTFS_DIR / "gtfs.zip"

    def __init__(self, *args, **kwargs):
        """!
        @brief Initialize the command, setting up key, timer and archive attributes.
        """

        super().__init__(*args, **kwargs)
        self.key = None
        self.archive = False
        self.interval = None

    def add_arguments(self, parser) -> None:
        """!
        @brief Add command line arguments for the script.
        """

        parser.add_argument('-t', '--time', type=int, default=11, help='time in seconds between scrap')
        # This can be also set with WAW_API_KEY variable. The flag overrides the env variable
        parser.add_argument('-K', '--key', help='api key for api.um.warszawa.pl', default=None)
        parser.add_argument('-a', '--archive', action="store_true", help='archive data')

        # TODO
        # slightly ugly, fix later
        # Save it so we can use it later to write an error
        self.parser = parser

    def handle(self, *args, **options) -> None:
        """!
        @brief Main handler for the command, manages the scraping and reading processes.
        """

        # Handle SIGINT (Ctrl + C) as a way to stop the program
        signal.signal(signal.SIGINT, self.sigint_handler)

        # TODO
        # ugly, fix later
        if os.path.exists('/run/secrets/waw_api_key'):
            with open('/run/secrets/waw_api_key', 'r') as f:
                self.key = f.read().strip()
        elif 'WAW_API_KEY' in os.environ:
            self.key = os.getenv('WAW_API_KEY')
        elif options['key']:
            self.key = options['key']
        else:
            self.parser.error("API key is required - either set WAW_API_KEY environmental variable, use the -K/--key argument")

        self.archive = options['archive']
        self.interval = options['time']

        self.scraper = Scraper(GTFS_DIR, self.key, self.archive, self.interval)
        self.scraper.run()


    def sigint_handler(self, signal, frame) -> None:
        """!
        @brief Handle SIGINT. It's currently the only way to exit the program, so it should display a nice
        message.
        """

        print("KeyboardInterrupt detected. Cleaning up unfinished work. Marking an exit to reload the timetable on the next run")

        self.cleanup()

        print("Cleanup completed")
        print("Quiting")

        # Exit without errors, we handle SIGINT after all
        sys.exit(0)

    def cleanup(self) -> None:
        """!
        @brief Remove the files which we couldn't finish processing.
        """
        try:
            self.positions.unlink(missing_ok=True)
            print("Removed positions")
        except:
            print("Unexpected error encountered while trying to remove positions.json")
