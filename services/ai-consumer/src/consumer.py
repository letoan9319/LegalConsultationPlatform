from aiokafka import AIOKafkaConsumer
from .processors.legal_reference import LegalReferenceProcessor
from .processors.summarizer import SummarizerProcessor
from .cache import AIResponseCache
from .response_producer import AIResponseProducer
from .config import get_settings
import json
import structlog
import asyncio
from typing import Optional

logger = structlog.get_logger()


class AIServiceConsumer:
    def __init__(self):
        self.settings = get_settings()
        self.consumer: Optional[AIOKafkaConsumer] = None
        self.cache = AIResponseCache(self.settings.redis_url)
        self.response_producer = AIResponseProducer(self.settings.kafka_bootstrap_servers)
        self.processors = {
            "LEGAL_REFERENCE": LegalReferenceProcessor(),
            "SESSION_SUMMARY": SummarizerProcessor(),
        }

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            "ai.request",
            bootstrap_servers=self.settings.kafka_bootstrap_servers,
            group_id=self.settings.kafka_group_id,
            enable_auto_commit=False,
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        )

        await self.consumer.start()
        await self.cache.start()
        await self.response_producer.start()

        for processor in self.processors.values():
            if hasattr(processor, "initialize"):
                await processor.initialize()

        logger.info("ai_consumer_started")

    async def consume(self):
        try:
            async for msg in self.consumer:
                start_time = asyncio.get_event_loop().time()

                try:
                    request = msg.value
                    request_type = request.get("request_type", "UNKNOWN")

                    cache_key = f"{request_type}:{hash(request.get('query', ''))}"
                    cached = await self.cache.get(cache_key)

                    if cached:
                        response = cached
                        logger.info("ai_response_cached", request_id=request.get("request_id"))
                    else:
                        processor = self.processors.get(request_type)
                        if processor:
                            response = await processor.process(request)
                            await self.cache.set(cache_key, response)
                        else:
                            logger.warning("unknown_request_type", request_type=request_type)
                            await self.consumer.commit()
                            continue

                    await self.response_producer.send_response(response)

                    processing_time = (asyncio.get_event_loop().time() - start_time) * 1000
                    logger.info(
                        "ai_request_processed",
                        request_id=request.get("request_id"),
                        request_type=request_type,
                        processing_time_ms=processing_time,
                    )

                    await self.consumer.commit()

                except Exception as e:
                    logger.error("ai_request_failed", error=str(e))
                    await self._escalate_to_lawyer(msg.value, str(e))
                    await self.consumer.commit()

        except Exception as e:
            logger.error("consumer_error", error=str(e))
            raise

    async def _escalate_to_lawyer(self, request: dict, error: str):
        logger.warning("escalating_to_lawyer", session_id=request.get("session_id"))

    async def stop(self):
        if self.consumer:
            await self.consumer.stop()
        await self.cache.stop()
        await self.response_producer.stop()
        logger.info("ai_consumer_stopped")
