"""
This module contains functions for downloading and generating GTFS files, brigades.json file and
vehicle positions.json file.
"""

import os
import subprocess
import zipfile
from datetime import datetime
from pathlib import Path

from project_config.settings import GTFS_DIR


compiled_go_binary_name = Path("warsawgtfs_realtime")
compiled_go_exe_name = Path("warsawgtfs_realtime.exe")

def download_positions(key: str, data_rt: Path, brigades: Path) -> None:
    """!
    @brief Scrap current vehicle positions using subprocess to call external Go script.

    @param key API key for the ZTM API
    @param data_rt The path to the data_rt directory.
    @param brigades The path to the brigades.json file.
    """

    print(f"{datetime.now()} Stepping into WarsawGTFS directory")
    os.chdir(GTFS_DIR)

    try:
        if compiled_go_binary_name.is_file():
            print("Found a compiled WarsawGTFS realtime go binary")
            command_path: Path = GTFS_DIR / compiled_go_binary_name
            command = (f'"{command_path}" '
                       f'-p '
                       f'-k "{key}" '
                       f'-readable '
                       f'-target "{data_rt}" '
                       f'-brigades-file "{brigades}" '
                       f'-json'
            )
        elif compiled_go_exe_name.is_file():
            print("Found a compiled WarsawGTFS realtime go exe")
            command_path: Path = GTFS_DIR / compiled_go_exe_name
            command = (f'"{command_path}" '
                       f'-p '
                       f'-k "{key}" '
                       f'-readable '
                       f'-target "{data_rt}" '
                       f'-brigades-file "{brigades}" '
                       f'-json'
            )
        else:
            print("Couldn't find a compiled WarsawGTFS realtime go binary. Trying to use \"go run\"")
            command = (f'go run warsawgtfs_realtime.go '
                       f'-p '
                       f'-k "{key}" '
                       f'-readable '
                       f'-target "{data_rt}" '
                       f'-brigades-file "{brigades}" '
                       f'-json'
            )

        subprocess.call(command, shell=True)

    except:
        print("FAILURE IN EXECUTING WARSAWGTFS REALTIME SCRIPT!")

    print(f"{datetime.now()} Done")

    print(f"{datetime.now()} Stepping out of WarsawGTFS directory")
    os.chdir("..")

def download_gtfs() -> None:
    """!
    @brief Download GTFS files using a subprocess and extract the contents.
    """

    print("\nDownloading GTFS files")
    print("Stepping into WarsawGTFS directory")

    os.chdir(GTFS_DIR)
    subprocess.call("python warsawgtfs.py --shapes --no-shape-simplification", shell=True)

    print("Unzipping GTFS files")
    with zipfile.ZipFile("gtfs.zip", 'r') as zip_ref:
        zip_ref.extractall("data_gtfs")

    print("Stepping out of WarsawGTFS directory")
    os.chdir("..")
    print("GTFS files downloaded")

def download_brigades(key: str, block=False) -> None:
    """!
    @brief Download and generate a brigades file based on earlier downloaded gtfs, using a subprocess.

    @param key API key for the ZTM API
    @param block If True, the function will block until the download is finished.
    """

    compiled_go_binary_name = Path("warsawgtfs_realtime")
    compiled_go_exe_name = Path("warsawgtfs_realtime.exe")

    print("\nDownloading Brigades files")
    print("Stepping into WarsawGTFS directory")

    os.chdir(GTFS_DIR)

    try:
        if compiled_go_binary_name.is_file():
            print("Found a compiled WarsawGTFS realtime go binary")
            command = [
                f'{GTFS_DIR}/{compiled_go_binary_name}',
                "-b", "-k", key,
                "-gtfs-file", "gtfs.zip"
            ]
        elif compiled_go_exe_name.is_file():
            print("Found a compiled WarsawGTFS realtime go exe")
            command = [
                f'{GTFS_DIR}/{compiled_go_exe_name}',
                "-b", "-k", key,
                "-gtfs-file", "gtfs.zip"
            ]
        else:
            print("Couldn't find a compiled WarsawGTFS realtime go binary. Trying to use \"go run\"")
            command = [
                "go", "run",
                "warsawgtfs_realtime.go",
                "-b", "-k", key,
                "-gtfs-file", "gtfs.zip"
            ]

        if not block:
            process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if process.poll() is None:
                print("Downloading Brigades started, main script continues...")
        else:
            process = subprocess.call(command)

    except:
        print("FAILURE IN EXECUTING WARSAWGTFS REALTIME SCRIPT!")

    print("Stepping out of WarsawGTFS directory")
    os.chdir("..")
