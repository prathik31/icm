import json
from typing import Any, Dict, Optional
from kafka import KafkaConsumer
from kafka.errors import KafkaError


class KafkaEventConsumer:
    def __init__(self, bootstrap_servers: str, topic: str, group_id: str = "anomaly-agent") -> None:
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        self.group_id = group_id
        self.consumer: Optional[KafkaConsumer] = None
        self._connect()

    def _connect(self) -> None:
        try:
            self.consumer = KafkaConsumer(
                self.topic,
                bootstrap_servers=self.bootstrap_servers,
                group_id=self.group_id,
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                auto_offset_reset="earliest",
                enable_auto_commit=True,
            )
        except KafkaError:
            self.consumer = None

    def poll(self) -> Optional[Any]:
        if self.consumer is None:
            return None
        try:
            records = self.consumer.poll(timeout_ms=500)
            return records
        except KafkaError:
            return None

    def close(self) -> None:
        if self.consumer is not None:
            try:
                self.consumer.close()
            except KafkaError:
                pass
