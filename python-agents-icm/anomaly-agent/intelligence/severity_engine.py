from typing import Dict


class SeverityEngine:
    def determine_severity(self, anomalous_metrics: Dict[str, float], isolation_score: float) -> str:
        anomaly_count = len(anomalous_metrics)
        strongest_z = max((abs(value) for value in anomalous_metrics.values()), default=0.0)

        if anomaly_count >= 2 or (isolation_score < -0.5 and anomaly_count >= 1):
            return "HIGH"
        if strongest_z > 6.0 or isolation_score < -1.0:
            return "CRITICAL"
        if strongest_z > 4.0 or isolation_score < -0.2:
            return "MEDIUM"
        if anomaly_count == 1:
            return "LOW"
        return "LOW"
