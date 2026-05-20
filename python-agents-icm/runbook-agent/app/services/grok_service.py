import json
from openai import OpenAI

from app.core.config import settings

client = OpenAI(
    api_key=settings.GROK_API_KEY,
    base_url=settings.GROK_BASE_URL,
)

SYSTEM_PROMPT = """
You are an expert telecom network operations engineer.

Generate a detailed operational runbook.

Output ONLY valid JSON.
"""


def generate_runbook(user_prompt: str):

    response = client.chat.completions.create(
        model=settings.GROK_MODEL,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        temperature=0.3
    )

    raw = response.choices[0].message.content

    raw = raw.replace("```json", "")
    raw = raw.replace("```", "")
    raw = raw.strip()

    return json.loads(raw)
