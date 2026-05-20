from typing import List, Optional
import numpy as np
from sklearn.ensemble import IsolationForest


class IsolationForestDetector:
    def __init__(self) -> None:
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.05,
            random_state=42,
        )

    def score(self, values: List[float]) -> float:
        if len(values) < 2:
            return 0.0
        data = np.array(values, dtype=float).reshape(-1, 1)
        self.model.fit(data)
        anomaly_scores = self.model.score_samples(data)
        return float(np.mean(anomaly_scores))

    def is_anomalous(self, score: float) -> bool:
        return score < 0.0
