from typing import Any
from fastapi.encoders import jsonable_encoder


class ResponseBuilder:
    def build(self, payload: Any) -> Any:
        encoded = jsonable_encoder(payload)
        if isinstance(encoded, dict) and "detected_at" in encoded:
            detected_at = encoded["detected_at"]
            if isinstance(detected_at, str):
                encoded["detected_at"] = detected_at
        return encoded
