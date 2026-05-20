from datetime import datetime, timezone
from typing import Dict, Any
from uuid import uuid4

from ml.predictor import Predictor
from .severity_engine import SeverityEngine
from .rolling_window import validate_window_bounds


class AnomalyEngine:
    def __init__(self) -> None:
        self.predictor = Predictor()
        self.severity_engine = SeverityEngine()

    def evaluate(self, request_payload: Dict[str, Any]) -> Dict[str, Any]:
        window_start = request_payload["window_start"]
        window_end = request_payload["window_end"]
        validate_window_bounds(window_start, window_end)

        metrics = {metric["metric_name"]: {
            "current_value": metric["current_value"],
            "baseline_mean": metric["baseline_mean"],
            "baseline_std": metric["baseline_std"],
        } for metric in request_payload["metrics"]}

        result = self.predictor.evaluate(metrics)
        severity = self.severity_engine.determine_severity(
            result["anomalous_metrics"],
            result["isolation_forest_score"],
        )

        return {
            "detection_id": str(uuid4()),
            "cr_id": request_payload["cr_id"],
            "asset_id": request_payload["asset_id"],
            "severity": severity,
            "confidence": min(max(0.0, 1.0 - abs(result["isolation_forest_score"] / 10.0)), 1.0),
            "isolation_forest_score": result["isolation_forest_score"],
            "anomalous_metrics": [
                {"metric_name": name, "z_score": score}
                for name, score in result["anomalous_metrics"].items()
            ],
            "detected_at": datetime.now(timezone.utc),
            "anomaly": result["anomaly"],
        }
