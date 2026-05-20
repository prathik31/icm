from fastapi import FastAPI
from .response_builder import ResponseBuilder
from config.settings import Settings
from config.logging_config import configure_logging
from persistence.redis_cache import RedisCache
from llm.groq_client import GroqClient
from llm.prompt_builder import PromptBuilder
from llm.anomaly_reasoner import AnomalyReasoner
from messaging.kafka_producer import KafkaEventProducer
from persistence.mysql_client import MySQLClient
from persistence.repository import Repository


def initialize_settings() -> Settings:
    settings = Settings()
    configure_logging(settings.log_level)
    return settings


def initialize_redis(settings: Settings) -> RedisCache:
    return RedisCache(settings.redis_url)


def initialize_groq(settings: Settings) -> AnomalyReasoner:
    client = GroqClient(settings.groq_api_key, settings.groq_model)
    return AnomalyReasoner(client, PromptBuilder())


def initialize_kafka(settings: Settings) -> KafkaEventProducer:
    return KafkaEventProducer(settings.kafka_bootstrap_servers)


def initialize_repository(settings: Settings) -> Repository:
    engine = MySQLClient(settings.mysql_url).get_engine()
    return Repository(engine)


def attach_components(app: FastAPI) -> None:
    app.state.settings = initialize_settings()
    app.state.redis_cache = initialize_redis(app.state.settings)
    app.state.groq_reasoner = initialize_groq(app.state.settings)
    app.state.kafka_producer = initialize_kafka(app.state.settings)
    app.state.repository = initialize_repository(app.state.settings)
    app.state.response_builder = ResponseBuilder()
