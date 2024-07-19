"""!
Helper functions for the GTFS loading code.
"""

import datetime
import hashlib
import numpy as np
import scipy.stats as stats
from typing import Set


def iid(unique_string: str) -> int:
    """!
    @brief Generates an integer ID based on the SHA-256 hash of a unique string.

    @param unique_string A string that is unique for each object.
    @return A hashed integer ID.
    """

    hash_object = hashlib.md5(unique_string.encode())
    return int(hash_object.hexdigest(), 16) % (1 << 63)


def time_validator(value: str) -> str:
    """!
    @brief Validates and corrects a time string to a 24-hour format.

    @param value A time string in the format HH:MM:SS.
    @return A time string in the correct 24-hour HH:MM:SS format.
    """

    k = value.split(":")
    return f"{int(k[0]) % 24}:" + ":".join(k[1:]) if int(k[0]) >= 24 else value


def validate_trip_id(trip_id: str) -> bool:
    """!
    @brief Validates a trip ID (No Skm and Trams)

    @param trip_id A trip ID string.
    @return A boolean on whether the trip ID is valid or not.
    """

    route = str(trip_id.split('/')[0])

    if route.isdigit() and int(route) < 100:
        return False

    if route.startswith("S"):
        return False

    return True

def stop_is_on_demand(type_number : str) -> bool:
    """!
    @brief Returns a boolean on whether the stop for a trip is on-demand or not

    @param type_number A type number string.
    @return A boolean on whether the stop is on-demand or not.
    """

    if type_number == "3":
        return True
    else:
        return False

def get_stop_name(name: str, existing_names: Set[str]) -> str:
    """!
    @brief Generates a unique stop name, avoiding duplicates.

    When the stop loading code encounters 2 stops with the same name, it
    calls this function to make a unique name for each stop.

    @param name The name of the stop.
    @param existing_names A set of existing stop names.
    @return A unique stop name.
    """
    if name not in existing_names:
        existing_names.add(name)
        return name

    increment = 1
    while True:
        new_name = f"{name} ({increment})"
        if new_name not in existing_names:
            existing_names.add(new_name)
            return new_name
        increment += 1

def calculate_averages(differences):
    """!
    @brief Calculates the average of a list of differences.

    @param differences A list of differences.
    @return The average of the differences.
    """

    times = [difference.time for difference in differences]
    latencies = [difference.latency for difference in differences]

    count = len(differences)
    avg_time = np.mean(times)
    avg_latency = np.mean(latencies)
    median_latency = np.median(latencies)
    trimmed_latency = stats.trim_mean(latencies, 0.1)

    return count, avg_time, avg_latency, median_latency, trimmed_latency

def convert_delta_to_str(delta: datetime.timedelta) -> str:
    """!
    @brief Convert a datetime.timedelta object to a string in the format HH h MM min SS s

    @param delta A datetime.timedelta object
    @return The string representation of the datetime.timedelta object
    """
    
    total_seconds = delta.total_seconds()

    is_negative = total_seconds < 0

    hours, remainder = divmod(abs(total_seconds), 3600)
    minutes, seconds = divmod(remainder, 60)

    sign = "-" if is_negative else ""

    return f"{sign}{int(hours)}h {int(minutes)}min {int(seconds)}s"
