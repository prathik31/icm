from typing import Dict, Optional


class ZScoreDetector:
    THRESHOLD = 3.0

    @staticmethod
    def calculate_z_score(current_value: float, baseline_mean: float, baseline_std: float) -> Optional[float]:
        if baseline_std == 0:
            return None
        return (current_value - baseline_mean) / baseline_std

    def detect(self, metrics: Dict[str, Dict[str, float]]) -> Dict[str, float]:
        anomalies: Dict[str, float] = {}
        for name, payload in metrics.items():
            z_score = self.calculate_z_score(
                payload["current_value"],
                payload["baseline_mean"],
                payload["baseline_std"],
            )
            if z_score is None:
                continue
            if abs(z_score) > self.THRESHOLD:
                anomalies[name] = z_score
        return anomalies
