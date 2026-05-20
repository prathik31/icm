from typing import Dict, Any
from redis import Redis
from redis.exceptions import RedisError


class BaselineEngine:
    def __init__(self, cache_client: Redis | None = None) -> None:
        self.cache_client = cache_client

    def cache_baseline(self, key: str, baseline: Dict[str, Any]) -> None:
        if self.cache_client is None:
            return
        try:
            self.cache_client.hset(key, mapping={k: str(v) for k, v in baseline.items()})
        except RedisError:
            pass

    def get_cached_baseline(self, key: str) -> Dict[str, Any] | None:
        if self.cache_client is None:
            return None
        try:
            raw = self.cache_client.hgetall(key)
            if not raw:
                return None
            return {k.decode("utf-8"): v.decode("utf-8") for k, v in raw.items()}
        except RedisError:
            return None
