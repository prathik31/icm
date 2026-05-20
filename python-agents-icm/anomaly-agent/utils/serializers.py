from datetime import datetime, timezone
from typing import Any
from fastapi.encoders import jsonable_encoder


def serialize_payload(payload: Any) -> Any:
    encoded = jsonable_encoder(payload)
    if isinstance(encoded, dict) and "detected_at" in encoded:
        detected_at = encoded.get("detected_at")
        if isinstance(detected_at, datetime):
            encoded["detected_at"] = detected_at.astimezone(timezone.utc).isoformat()
    return encoded
