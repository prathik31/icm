import os
from typing import Any, Dict, Optional
from groq import Groq


class GroqClient:
    def __init__(self, api_key: Optional[str], model_name: str) -> None:
        self.api_key = api_key
        self.model_name = model_name
        self.client: Optional[Groq] = None
        if api_key:
            try:
                self.client = Groq(api_key=api_key)
            except Exception:
                self.client = None

    def predict(self, prompt: str) -> str:
        if self.client is None or self.api_key is None:
            raise RuntimeError("Groq client is unavailable")
        response = self.client.predict(
            model=self.model_name,
            input=prompt,
            max_tokens=120,
        )
        return str(response)
