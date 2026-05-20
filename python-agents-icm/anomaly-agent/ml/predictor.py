from typing import Dict, Any
from .zscore_detector import ZScoreDetector
from .isolation_forest_detector import IsolationForestDetector
from .feature_engine import FeatureEngine


class Predictor:
    def __init__(self) -> None:
        self.zscore_detector = ZScoreDetector()
        self.iforest_detector = IsolationForestDetector()
        self.feature_engine = FeatureEngine()

    def evaluate(self, metrics: Dict[str, Dict[str, float]]) -> Dict[str, Any]:
        anomalous_metrics = self.zscore_detector.detect(metrics)
        feature_matrix = self.feature_engine.build_feature_matrix(metrics)
        isolation_score = self.iforest_detector.score([value[0] for value in feature_matrix])
        is_anomaly = bool(anomalous_metrics) or self.iforest_detector.is_anomalous(isolation_score)

        return {
            "anomaly": is_anomaly,
            "anomalous_metrics": anomalous_metrics,
            "isolation_forest_score": isolation_score,
        }
