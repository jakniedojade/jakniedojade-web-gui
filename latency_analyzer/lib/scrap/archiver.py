import shutil
import multiprocessing
import random
from pathlib import Path
from datetime import timedelta, datetime
from time import sleep

from latency_analyzer.lib.scrap.downloader import download_positions, download_gtfs, download_brigades

from project_config.settings import BASE_DIR

class Archiver():
    """!
    Scraper class for saving downloaded files into archives for later use.

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
        @brief Set up a seperate process to download positions, while the main one will download gtfs
        files and brigades.
        
        This way we won't have holes in our data.
        """

        # "spawn" is known to work on Windows. "fork" is faster but works only on Unix
        # for compatibility and easier testing we force to start the new process with "spawn" for now
        multiprocessing.set_start_method('spawn')
        # False means the pipe is unidirectional (log_pipe_start -> log_pipe_end)
        self.log_pipe_end, self.log_pipe_start = multiprocessing.Pipe(False)
        position_archive_proc = multiprocessing.Process(target=Archiver.archive_concurent,
                                                        args=(self.log_pipe_end, self.positions,
                                                              self.next_pos_run_time,
                                                              self.next_gtfs_run_time,
                                                              self.interval,
                                                              self.key, self.data_rt, self.brigades))
        position_archive_proc.daemon = True

        if not self.positions.exists():
            self.load_timetable(block=True)

        position_archive_proc.start()
        self.main_loop()


    def main_loop(self) -> None:
        """!
        @brief The main loop of the scraper. It will download gtfs files and brigades, and then sleep.
        """
        while True:
            if datetime.now() >= self.next_gtfs_run_time:
                self.load_timetable()
            sleep((self.next_gtfs_run_time - datetime.now()).total_seconds())

    def load_timetable(self, block: bool = False) -> None:
        """!
        @brief Download gtfs files and brigades, and then archive them.

        @param block If True, the function will block until the download is finished.
        """

        block = True

        download_gtfs()
        download_brigades(self.key, block=block)

        self.archive_gtfs_brigades()

        next_run_delta = timedelta(hours=random.uniform(3, 8))
        self.next_gtfs_run_time = datetime.now() + next_run_delta
        # Send the new next_gtfs_run_time to the position archiving process so it can display
        # the time to the next gtfs download after we finished here
        self.log_pipe_start.send(self.next_gtfs_run_time)

    def archive_gtfs_brigades(self) -> None:
        """!
        @brief Try to save the downloaded gtfs.zip and brigades.json files in a directory with a correct
        timestamp for their filenames.
        """
        archive_gtfs_dir = BASE_DIR / "archive_gtfs"
        archive_brigades_dir = BASE_DIR / "archive_brigades"
        archive_gtfs_dir.mkdir(parents=True, exist_ok=True)
        archive_brigades_dir.mkdir(parents=True, exist_ok=True)

        archive_both_prefix = f"{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}"
        archive_gtfs_name = archive_both_prefix + ".zip"
        archive_brigades_name = archive_both_prefix + ".json"

        try:
            shutil.copy(self.gtfs_archive, archive_gtfs_dir / archive_gtfs_name)
            print(f"{datetime.now()} File {archive_gtfs_name} has been archived")
        except:
            print(f"{datetime.now()} File {archive_gtfs_name} couldn't be archived")

        try:
            shutil.copy(self.brigades, archive_brigades_dir / archive_brigades_name)
            print(f"{datetime.now()} File {archive_brigades_name} has been archived")
        except:
            print(f"{datetime.now()} File {archive_brigades_name} couldn't be archived")

    @staticmethod
    def archive_positions(positions) -> None:
        """!
        @brief Try to save the downloaded positions.json file in a directory with a correct timestamp
        for its filename.

        @param positions The path to the positions.json file.
        """
        
        archive_dir = BASE_DIR / "archive_positions"
        archive_dir.mkdir(parents=True, exist_ok=True)

        archive_positions_name = f"{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json"

        try:
            shutil.copy(positions, archive_dir / archive_positions_name)
            print(f"{datetime.now()} File {archive_positions_name} has been archived")
        except:
            print(f"{datetime.now()} File {archive_positions_name} couldn't be archived")

    @staticmethod
    def archive_concurent(log_pipe_end, positions, next_pos_run_time, next_gtfs_run_time, interval,
                          key, data_rt, brigades) -> None:
        """!
        @brief The static method which is run by the position archiving process.
         
        This done this was, so we can still download positions.json files while downloading new gtfs
        files and generating brigades.
        It has to be a static method to work with the "spawn" method of starting a new process.

        @param log_pipe_end The end of the pipe used to send the next_gtfs_run_time to this process.
        @param positions The path to the positions.json file.
        @param next_pos_run_time The time when the next positions download should start.
        @param next_gtfs_run_time The time when the next gtfs download should start.
        @param interval The interval between positions downloads.
        @param key The API key used to download positions.
        @param data_rt The path to the data_rt directory.
        @param brigades The path to the brigades.json file.
        """

        while True:
            if datetime.now() >= next_pos_run_time:
                next_pos_run_time = datetime.now() + timedelta(seconds=interval)

                download_positions(key, data_rt, brigades)
                Archiver.archive_positions(positions)

                # Recieve new next_gtfs_run_time times if they are available to display them
                if log_pipe_end.poll():
                    next_gtfs_run_time = log_pipe_end.recv()

                # Check if next_gtfs_run_time is in the past (the other process probably started
                # downloading gtfs files and generating brigades)
                if (next_gtfs_run_time - datetime.now()).total_seconds() > 0:
                    print(f"{datetime.now()} Next gtfs/brigades run time: {next_gtfs_run_time}, "
                          f"Left: {next_gtfs_run_time - datetime.now()}, Next pos run time: {next_pos_run_time}, "
                          f"Left: {next_pos_run_time - datetime.now()}")
                else:
                    print(f"{datetime.now()} Next gtfs/brigades run time: IN PROGRESS, "
                          f"Left: 0, Next pos run time: {next_pos_run_time}, "
                          f"Left: {next_pos_run_time - datetime.now()}")
            else:
                total_seconds = (next_pos_run_time - datetime.now()).total_seconds()
                print(f"Sleeping for {round(total_seconds, 2)} seconds")
                sleep((next_pos_run_time - datetime.now()).total_seconds())
