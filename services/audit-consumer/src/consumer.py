from aiokafka import AIOKafkaConsumer
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroDeserializer
from .db_writer import AuditDBWriter
from .dlq_handler import DLQHandler
from .config import get_settings
import json
import structlog
from typing import Optional

logger = structlog.get_logger()


class AuditLogConsumer:
    def __init__(self):
        self.settings = get_settings()
        self.consumer: Optional[AIOKafkaConsumer] = None
        self.db_writer = AuditDBWriter(self.settings.database_url)
        self.dlq_handler = DLQHandler(self.settings.dlq_bootstrap_servers)
        self.running = False
        self._schema_registry_client: Optional[SchemaRegistryClient] = None
        self._deserializers = {}

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            "audit.log",
            "chat.message",
            bootstrap_servers=self.settings.kafka_bootstrap_servers,
            group_id=self.settings.kafka_group_id,
            enable_auto_commit=self.settings.enable_auto_commit,
            auto_offset_reset=self.settings.auto_offset_reset,
            isolation_level=self.settings.isolation_level,
            max_poll_records=self.settings.max_poll_records,
            session_timeout_ms=self.settings.session_timeout_ms,
            heartbeat_interval_ms=self.settings.heartbeat_interval_ms,
        )
        await self.consumer.start()
        await self.db_writer.start()
        await self.dlq_handler.start()
        self.running = True
        await self._load_deserializers()
        logger.info("audit_consumer_started")

    async def _load_deserializers(self):
        self._schema_registry_client = SchemaRegistryClient(
            {"url": self.settings.schema_registry_url, "max_cache_size": 1000}
        )
        subjects = ["audit-event-value", "chat-message-value"]

        for subject in subjects:
            try:
                schema_info = self._schema_registry_client.get_latest_version(subject)
                schema_str = schema_info.schema.schema_str
                self._deserializers[subject] = AvroDeserializer(
                    schema_str, self._schema_registry_client
                )
            except Exception:
                pass

    async def consume(self):
        try:
            async for msg in self.consumer:
                try:
                    event = self._deserialize(msg.value, msg.topic)

                    await self.db_writer.write_audit_event(event)
                    await self.consumer.commit()

                    logger.info(
                        "audit_event_processed",
                        event_id=event.get("event_id"),
                        event_type=event.get("event_type"),
                    )

                except Exception as e:
                    logger.error(
                        "audit_event_processing_failed",
                        error=str(e),
                        topic=msg.topic,
                        offset=msg.offset,
                    )
                    await self.dlq_handler.send_to_dlq(msg.topic, msg, str(e))
                    await self.consumer.commit()

        except Exception as e:
            logger.error("consumer_error", error=str(e))
            raise

    def _deserialize(self, value: bytes, topic: str) -> dict:
        subject = f"{topic}-value" if topic == "audit.log" else topic
        if subject in self._deserializers:
            return self._deserializers[subject].deserialize(value)
        return json.loads(value)

    async def stop(self):
        self.running = False
        if self.consumer:
            await self.consumer.stop()
        await self.db_writer.close()
        await self.dlq_handler.stop()
        logger.info("audit_consumer_stopped")
