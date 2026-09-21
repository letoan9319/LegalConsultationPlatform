from aiokafka import AIOKafkaConsumer
from .notifier import NotifierService
from .config import get_settings
import json
import structlog
from typing import Optional

logger = structlog.get_logger()


class NotifierConsumer:
    def __init__(self):
        self.settings = get_settings()
        self.consumer: Optional[AIOKafkaConsumer] = None
        self.notifier = NotifierService()

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            "consultation.events",
            bootstrap_servers=self.settings.kafka_bootstrap_servers,
            group_id=self.settings.kafka_group_id,
            enable_auto_commit=False,
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        )
        await self.consumer.start()
        logger.info("notifier_consumer_started")

    async def consume(self):
        try:
            async for msg in self.consumer:
                event = msg.value
                event_type = event.get("event_type")

                if event_type == "CREATED":
                    await self.notifier.notify_lawyers(event)
                elif event_type == "ASSIGNED":
                    await self.notifier.notify_customer_assignment(event)
                elif event_type == "COMPLETED":
                    await self.notifier.send_completion_notification(event)

                await self.consumer.commit()

        except Exception as e:
            logger.error("consumer_error", error=str(e))
            raise

    async def stop(self):
        if self.consumer:
            await self.consumer.stop()
        logger.info("notifier_consumer_stopped")
