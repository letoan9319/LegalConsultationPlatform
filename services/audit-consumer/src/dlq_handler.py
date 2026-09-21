from aiokafka import AIOKafkaProducer
from typing import Optional
import json
from datetime import datetime


class DLQHandler:
    def __init__(self, bootstrap_servers: str):
        self.bootstrap_servers = bootstrap_servers
        self._producer: Optional[AIOKafkaProducer] = None

    async def start(self):
        self._producer = AIOKafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
        )
        await self._producer.start()

    async def send_to_dlq(self, topic: str, original_msg, error: str):
        if not self._producer:
            raise RuntimeError("DLQ producer not initialized")

        dlq_event = {
            "original_topic": original_msg.topic,
            "original_partition": original_msg.partition,
            "original_offset": original_msg.offset,
            "original_key": original_msg.key.decode("utf-8") if original_msg.key else None,
            "error": error,
            "failed_at": datetime.utcnow().isoformat(),
            "payload": original_msg.value.decode("utf-8") if isinstance(original_msg.value, bytes) else str(original_msg.value),
        }

        dlq_topic = f"{topic}.dlq"
        await self._producer.send_and_wait(
            topic=dlq_topic,
            value=dlq_event,
            key=original_msg.key,
        )

    async def stop(self):
        if self._producer:
            await self._producer.stop()
