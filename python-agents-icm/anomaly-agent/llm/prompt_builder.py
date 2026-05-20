from typing import Dict, List


class PromptBuilder:
    def build(self, context: Dict[str, str], anomalies: List[Dict[str, float]]) -> str:
        metric_lines = "\n".join(
            f"- {item['metric_name']}: z_score={item['z_score']:.2f}" for item in anomalies
        )
        return (
            "You are an anomaly detection analyst. "
            "Review the following KPI anomaly context and provide a concise explanation and likely cause.\n\n"
            f"CR ID: {context['cr_id']}\n"
            f"Asset ID: {context['asset_id']}\n"
            f"Severity: {context['severity']}\n"
            f"Metrics:\n{metric_lines}\n\n"
            "Answer with an explanation and a likely cause."
        )
