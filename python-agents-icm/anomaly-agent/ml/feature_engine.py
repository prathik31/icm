from typing import Dict, List


class FeatureEngine:
    def build_feature_matrix(self, metrics: Dict[str, Dict[str, float]]) -> List[List[float]]:
        return [[payload["current_value"]] for payload in metrics.values()]
