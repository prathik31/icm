from typing import Optional
from redis import Redis
from redis.exceptions import RedisError


class RedisCache:
    def __init__(self, url: str) -> None:
        self.url = url
        self.client: Optional[Redis] = None
        self._connect()

    def _connect(self) -> None:
        try:
            self.client = Redis.from_url(self.url, decode_responses=True)
            self.client.ping()
        except (RedisError, Exception):
            self.client = None

    def get(self, key: str) -> Optional[str]:
        if self.client is None:
            return None
        try:
            return self.client.get(key)
        except RedisError:
            return None

    def set(self, key: str, value: str, ex: int | None = None) -> None:
        if self.client is None:
            return
        try:
            self.client.set(key, value, ex=ex)
        except RedisError:
            pass
