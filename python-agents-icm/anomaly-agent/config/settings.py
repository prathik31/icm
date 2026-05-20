from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_env: str = "development"
    app_name: str = "anomaly-agent"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    log_level: str = "INFO"

    redis_url: str = "redis://localhost:6379/0"
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_topic_kpi: str = "kpi.events"
    kafka_topic_ai: str = "ai.events"
    kafka_topic_dlq: str = "kpi.events.dlq"

    groq_api_key: Optional[str] = None
    groq_model: str = "llama-3.3-70b-versatile"

    mysql_url: str = "mysql+pymysql://user:password@localhost:3306/anomaly_agent"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }
