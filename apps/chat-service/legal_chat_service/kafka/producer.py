from aiokafka import AIOKafkaProducer
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroSerializer
from typing import Optional
import json
import structlog
from datetime import datetime

log = structlog.get_logger()


class LegalKafkaProducer:
    def __init__(self, bootstrap_servers: str, schema_registry_url: str):
        self.bootstrap_servers = bootstrap_servers
        self.schema_registry_url = schema_registry_url
        self._producer: Optional[AIOKafkaProducer] = None
        self._schema_registry_client: Optional[SchemaRegistryClient] = None
        self._serializers = {}

    async def start(self):
        self._producer = AIOKafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            value_serializer=self._serialize,
            key_serializer=lambda k: k.encode("utf-8") if k else None,
            acks="all",
            enable_idempotence=True,
            compression_type="gzip",
        )
        await self._producer.start()
        log.info("kafka_producer_started")

        # Initialize Schema Registry client
        self._schema_registry_client = SchemaRegistryClient(
            {"url": self.schema_registry_url, "max_cache_size": 1000}
        )

        # Load schemas
        await self._load_schemas()

    async def _load_schemas(self):
        subjects = [
            "chat-message-value",
            "consultation-event-value",
            "audit-event-value",
        ]

        for subject in subjects:
            try:
                schema_info = self._schema_registry_client.get_latest_version(subject)
                schema_str = schema_info.schema.schema_str
                self._serializers[subject] = AvroSerializer(
                    schema_str, self._schema_registry_client
                )
            except Exception:
                # Schema not registered yet, will use JSON fallback
                pass

    def _serialize(self, value: dict) -> bytes:
        if "schema_name" in value and value["schema_name"] in self._serializers:
            serializer = self._serializers[value.pop("schema_name")]
            return serializer(value)
        return json.dumps(value).encode("utf-8")

    async def send_chat_message(
        self,
        message_id: str,
        session_id: str,
        sender_type: str,
        sender_id: Optional[str],
        content: str,
        content_type: str,
    ):
        event = {
            "schema_name": "chat-message-value",
            "message_id": message_id,
            "session_id": session_id,
            "sender_type": sender_type,
            "sender_id": sender_id,
            "content": content,
            "content_type": content_type,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": {"source": "chat-service", "version": "1.0"},
        }

        await self._producer.send_and_wait(topic="chat.message", value=event, key=session_id)

    async def send_consultation_event(
        self,
        session_id: str,
        customer_id: str,
        lawyer_id: Optional[str],
        event_type: str,
        legal_domain: str,
        status: str,
    ):
        event = {
            "schema_name": "consultation-event-value",
            "event_type": event_type,
            "session_id": session_id,
            "customer_id": customer_id,
            "lawyer_id": lawyer_id,
            "legal_domain": legal_domain,
            "session_type": "INITIAL",
            "status": status,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": {"source": "chat-service", "version": "1.0"},
        }

        await self._producer.send_and_wait(
            topic="consultation.events", value=event, key=session_id
        )

    async def send_audit_event(
        self,
        event_id: str,
        event_type: str,
        user_id: str,
        user_role: str,
        action: str,
        ip_address: str,
        user_agent: str,
        session_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
    ):
        event = {
            "schema_name": "audit-event-value",
            "event_id": event_id,
            "event_type": event_type,
            "user_id": user_id,
            "user_role": user_role,
            "session_id": session_id,
            "resource_type": resource_type or "unknown",
            "resource_id": resource_id,
            "action": action,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "timestamp": datetime.utcnow().isoformat(),
        }

        await self._producer.send_and_wait(topic="audit.log", value=event, key=event_id)

    async def stop(self):
        if self._producer:
            await self._producer.stop()
