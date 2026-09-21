import pytest
from unittest.mock import AsyncMock, MagicMock
from src.consumer import AuditLogConsumer
from src.db_writer import AuditDBWriter
from src.dlq_handler import DLQHandler


class TestAuditLogConsumer:
    @pytest.fixture
    def consumer(self):
        return AuditLogConsumer()

    def test_consumer_initialization(self, consumer):
        assert consumer.running is False
        assert consumer.settings is not None

    def test_db_writer_initialization(self):
        writer = AuditDBWriter("postgresql+asyncpg://user:pass@localhost:5432/legaldb")
        assert writer.database_url == "user:pass@localhost:5432/legaldb"

    def test_dlq_handler_initialization(self):
        handler = DLQHandler("localhost:9092")
        assert handler.bootstrap_servers == "localhost:9092"


class TestAuditDBWriter:
    @pytest.fixture
    def writer(self):
        return AuditDBWriter("postgresql+asyncpg://user:pass@localhost:5432/legaldb")

    def test_writer_initialization(self, writer):
        assert writer._pool is None

    @pytest.mark.asyncio
    async def test_write_audit_event_without_pool(self, writer):
        event = {
            "event_id": "test-123",
            "event_type": "USER_LOGIN",
            "user_id": "user-456",
            "user_role": "CUSTOMER",
            "action": "CREATE",
            "ip_address": "127.0.0.1",
            "timestamp": "2024-01-15T10:30:00",
        }
        with pytest.raises(RuntimeError, match="Database pool not initialized"):
            await writer.write_audit_event(event)


class TestDLQHandler:
    @pytest.fixture
    def handler(self):
        return DLQHandler("localhost:9092")

    def test_handler_initialization(self, handler):
        assert handler.bootstrap_servers == "localhost:9092"
        assert handler._producer is None

    @pytest.mark.asyncio
    async def test_send_to_dlq_without_producer(self, handler):
        mock_msg = MagicMock()
        mock_msg.topic = "test-topic"
        mock_msg.partition = 0
        mock_msg.offset = 100
        mock_msg.key = b"test-key"
        mock_msg.value = b'{"test": "data"}'

        with pytest.raises(RuntimeError, match="DLQ producer not initialized"):
            await handler.send_to_dlq("test-topic", mock_msg, "test error")
