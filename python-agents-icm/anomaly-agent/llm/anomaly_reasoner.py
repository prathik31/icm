from typing import Dict, Tuple
from .groq_client import GroqClient
from .prompt_builder import PromptBuilder


class AnomalyReasoner:
    def __init__(self, groq_client: GroqClient, prompt_builder: PromptBuilder) -> None:
        self.groq_client = groq_client
        self.prompt_builder = prompt_builder

    def explain(self, summary: Dict[str, str], anomalies: list[dict]) -> Tuple[str, str]:
        prompt = self.prompt_builder.build(summary, anomalies)
        try:
            result = self.groq_client.predict(prompt)
            explanation = result.strip()
            if not explanation:
                raise RuntimeError("Empty Groq response")
            return self._parse_response(explanation)
        except Exception:
            return (
                "An anomaly was detected, but detailed AI explanation is unavailable.",
                "Review system load and network behavior for likely root causes.",
            )

    def _parse_response(self, text: str) -> Tuple[str, str]:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        explanation = lines[0] if lines else "An anomaly was detected."
        likely_cause = lines[1] if len(lines) > 1 else "Potential infrastructure overload or service degradation."
        return explanation, likely_cause
