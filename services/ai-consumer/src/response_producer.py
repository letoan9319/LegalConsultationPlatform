from aiokafka import AIOKafkaProducer
from typing import Optional
import json


class AIResponseProducer:
    def __init__(self, bootstrap_servers: str):
        self.bootstrap_servers = bootstrap_servers
        self._producer: Optional[AIOKafkaProducer] = None

    async def start(self):
        self._producer = AIOKafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
            acks="all",
            enable_idempotence=True,
        )
        await self._producer.start()

    async def send_response(self, response: dict):
        if not self._producer:
            raise RuntimeError("Producer not initialized")
        await self._producer.send_and_wait(
            topic="ai.response",
            value=response,
            key=response.get("session_id"),
        )

    async def stop(self):
        if self._producer:
            await self._producer.stop()
