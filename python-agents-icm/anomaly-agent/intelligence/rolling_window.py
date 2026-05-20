from datetime import datetime
from typing import Tuple


def validate_window_bounds(start: datetime, end: datetime) -> Tuple[datetime, datetime]:
    if start >= end:
        raise ValueError("window_start must occur before window_end")
    return start, end
