from datetime import datetime, timezone
from typing import Any


def make_utc_now() -> datetime:
    return datetime.now(timezone.utc)


def ensure_timezone_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def safe_cast_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default
