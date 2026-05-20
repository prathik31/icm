from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict
)


class Settings(

    BaseSettings
):

    APP_NAME: str = (
        "ICM Risk Intelligence Agent"
    )

    APP_PORT: int = 9010

    KAFKA_BOOTSTRAP_SERVERS: str = (
        "localhost:9092"
    )

    CHANGE_REQUEST_TOPIC: str = (
        "change-requests"
    )

    RISK_ASSESSMENT_TOPIC: str = (
        "ai.risk.completed"
    )

    DLQ_TOPIC: str = (
        "risk-assessments-dlq"
    )

    MYSQL_URL: str = (
        "mysql+pymysql://root:Contract%401968@localhost/icm_risk_intelligence"
    )

    GROQ_API_KEY: str

    MODEL_PATH: str = (
        "models/"
    )

    model_config = (
        SettingsConfigDict(
            env_file=".env",
            extra="ignore"
        )
    )


settings = Settings()