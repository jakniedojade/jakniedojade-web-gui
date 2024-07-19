from latency_analyzer.lib.scrap.archiver import Archiver
from latency_analyzer.lib.scrap.reader import Reader

from pathlib import Path
from datetime import timedelta, datetime

class Scraper():
    """!
    Class to set up and run a specific scraper operation.
    """

    def __init__(self, GTFS_DIR, key, archive, interval):
        """!
        @param GTFS_DIR The path to the GTFS_DIR directory.
        @param key API key for the ZTM API
        @param archive Whether to archive the downloaded files or scrap and read them.
        @param interval The interval between scrap operations.
        """

        self.GTFS_DIR = GTFS_DIR

        self.key = key
        self.archive = archive
        self.interval = interval

        if self.archive:
            self.behaviour_handler = Archiver(self.GTFS_DIR, self.key, self.interval)
        else:
            self.behaviour_handler = Reader(self.GTFS_DIR, self.key, self.interval)

    def run(self) -> None:
        """!
        @brief Run the scraper operation.

        Before running, check if all required paths exist.
        """
        if not any(self.GTFS_DIR.iterdir()):              
            print("Error: Submodule WarsawGTFS is not downloaded.")
            print("To download the submodule, run the following commands:")
            print("git submodule init \ngit submodule update")
            return

        self.prepare_paths()
        self.redownload_files_if_too_old()
        
        self.behaviour_handler.run()

    def prepare_paths(self) -> None:
        """!
        @brief Check if all required paths exist and create them if necessary.
        """
        required_paths = [
            self.GTFS_DIR / "data_rt",
            self.GTFS_DIR / "data_gtfs",
            self.GTFS_DIR / "data_src"
        ]
        
        for path in required_paths:
            if not path.exists():
                path.mkdir(parents=True, exist_ok=True)

    def redownload_files_if_too_old(self) -> None:
        """!
        @brief Check if the files are too old and redownload them if necessary.
        """
        if self.archive:
            return
        brigades_path: Path = self.GTFS_DIR / "data_rt" / "brigades.json"

        if not brigades_path.exists():
            print("Brigades file does not exist. Downloading...")
            self.behaviour_handler.load_timetable(block=True)
            return

        brigades_date = datetime.fromtimestamp(brigades_path.stat().st_mtime)

        if (datetime.now() - brigades_date > timedelta(hours=8)):
            print("Brigades files are older than 8 hours. Downloading again...")
            self.behaviour_handler.load_timetable(block=True)
        else:
            print("Files are up to date.")
