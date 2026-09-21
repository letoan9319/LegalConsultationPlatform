from aiokafka import AIOKafkaConsumer
from .indexer import SearchIndexer
from .config import get_settings
import json
import structlog
from typing import Optional

logger = structlog.get_logger()


class SearchIndexerConsumer:
    def __init__(self):
        self.settings = get_settings()
        self.consumer: Optional[AIOKafkaConsumer] = None
        self.indexer = SearchIndexer(
            meilisearch_url=self.settings.meilisearch_url,
            api_key=self.settings.meilisearch_api_key,
        )

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            "consultation.events",
            "chat.message",
            bootstrap_servers=self.settings.kafka_bootstrap_servers,
            group_id=self.settings.kafka_group_id,
            enable_auto_commit=False,
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        )
        await self.consumer.start()
        logger.info("search_indexer_consumer_started")

    async def consume(self):
        try:
            async for msg in self.consumer:
                try:
                    if msg.topic == "consultation.events":
                        await self.indexer.index_consultation(msg.value)
                    elif msg.topic == "chat.message":
                        await self.indexer.index_chat_message(msg.value)

                    await self.consumer.commit()
                except Exception as e:
                    logger.error("indexing_failed", error=str(e), topic=msg.topic)
                    await self.consumer.commit()

        except Exception as e:
            logger.error("consumer_error", error=str(e))
            raise

    async def stop(self):
        if self.consumer:
            await self.consumer.stop()
        logger.info("search_indexer_consumer_stopped")
