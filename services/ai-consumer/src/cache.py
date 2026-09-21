import redis.asyncio as redis
from typing import Optional
import json


class AIResponseCache:
    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self._client: Optional[redis.Redis] = None
        self.default_ttl = 3600

    async def start(self):
        self._client = redis.from_url(
            self.redis_url,
            encoding="utf-8",
            decode_responses=True,
        )

    async def get(self, key: str) -> Optional[dict]:
        if not self._client:
            return None
        value = await self._client.get(f"ai:response:{key}")
        if value:
            return json.loads(value)
        return None

    async def set(self, key: str, value: dict, ttl: int = None):
        if not self._client:
            return
        await self._client.setex(
            f"ai:response:{key}",
            ttl or self.default_ttl,
            json.dumps(value),
        )

    async def stop(self):
        if self._client:
            await self._client.close()
