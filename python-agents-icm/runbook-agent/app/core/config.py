from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    APP_NAME: str
    APP_PORT: int

    GROQ_API_KEY: str
    GROQ_MODEL: str

    KAFKA_BROKERS: str
    ORCHESTRATOR_URL: str

    CHROMA_DB_DIR: str

    EMBED_MODEL: str

    class Config:
        env_file = ".env"


settings = Settings()
