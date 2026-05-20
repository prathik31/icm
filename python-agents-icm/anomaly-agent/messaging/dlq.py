from datetime import datetime, timezone
from typing import Any, Dict
from .kafka_producer import KafkaEventProducer


class DLQPublisher:
    def __init__(self, producer: KafkaEventProducer, topic: str) -> None:
        self.producer = producer
        self.topic = topic

    def publish(self, source_topic: str, payload: Dict[str, Any], error_message: str) -> bool:
        event = {
            "source_topic": source_topic,
            "payload": payload,
            "error_message": error_message,
            "failed_at": datetime.now(timezone.utc).isoformat(),
        }
        return self.producer.send(self.topic, event)
