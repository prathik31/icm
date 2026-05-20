from typing import Any, Dict
from sqlalchemy import text
from sqlalchemy.engine import Engine


class Repository:
    def __init__(self, engine: Engine) -> None:
        self.engine = engine

    def save_event(self, payload: Dict[str, Any]) -> None:
        try:
            with self.engine.begin() as connection:
                connection.execute(
                    text(
                        "INSERT INTO anomaly_events (detection_id, cr_id, asset_id, severity, payload) "
                        "VALUES (:detection_id, :cr_id, :asset_id, :severity, :payload)"
                    ),
                    {
                        "detection_id": payload["detection_id"],
                        "cr_id": payload["cr_id"],
                        "asset_id": payload["asset_id"],
                        "severity": payload["severity"],
                        "payload": str(payload),
                    },
                )
        except Exception:
            pass
