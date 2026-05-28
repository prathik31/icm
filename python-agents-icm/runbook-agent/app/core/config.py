from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    APP_NAME: str
    APP_PORT: int

    GROQ_API_KEY: str
    GROQ_MODEL: str

    KAFKA_BROKERS: str
    ORCHESTRATOR_URL: str

    CHROMA_DB_DIR: str

    EMBED_MODEL: str

    LOG_LEVEL: str = "INFO"

    DEBUG: bool = False

    model_config = ConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
