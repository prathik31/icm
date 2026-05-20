import json
from typing import Any, Dict, Optional
from kafka import KafkaProducer
from kafka.errors import KafkaError


class KafkaEventProducer:
    def __init__(self, bootstrap_servers: str) -> None:
        self.bootstrap_servers = bootstrap_servers
        self.producer: Optional[KafkaProducer] = None
        self._connect()

    def _connect(self) -> None:
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                retries=3,
                linger_ms=10,
                request_timeout_ms=10000,
            )
        except KafkaError:
            self.producer = None

    def send(self, topic: str, payload: Dict[str, Any]) -> bool:
        if self.producer is None:
            return False
        try:
            self.producer.send(topic, payload)
            self.producer.flush(timeout=10)
            return True
        except KafkaError:
            return False

    def close(self) -> None:
        if self.producer is not None:
            try:
                self.producer.close()
            except KafkaError:
                pass
