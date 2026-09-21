import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch


class TestConsumerIntegration:
    @pytest.fixture
    def event_loop(self):
        loop = asyncio.new_event_loop()
        yield loop
        loop.close()

    @pytest.mark.asyncio
    async def test_audit_consumer_message_flow(self):
        from services.audit-consumer.src.consumer import AuditLogConsumer
        from services.audit-consumer.src.db_writer import AuditDBWriter
        from services.audit-consumer.src.dlq_handler import DLQHandler

        consumer = AuditLogConsumer()
        assert consumer.settings is not None
        assert consumer.db_writer is not None
        assert consumer.dlq_handler is not None

    @pytest.mark.asyncio
    async def test_ai_consumer_cache_flow(self):
        from services.ai-consumer.src.consumer import AIServiceConsumer
        from services.ai-consumer.src.cache import AIResponseCache

        cache = AIResponseCache("redis://localhost:6379")
        assert cache.default_ttl == 3600
        await cache.start()
        assert cache._client is not None
        await cache.stop()

    @pytest.mark.asyncio
    async def test_metrics_consumer_buffering(self):
        from services.metrics-consumer.src.consumer import MetricsConsumer
        from services.metrics-consumer.src.anomaly_detector import AnomalyDetector
        from datetime import datetime

        detector = AnomalyDetector(threshold=0.7)
        features = [100.0, 0.9, 500.0, 10, 100.0, 0.01]
        is_anomaly, score, details = await detector.detect(features)
        
        assert isinstance(is_anomaly, bool)
        assert 0 <= score <= 1.0
        assert "contributing_features" in details


class TestNotifierIntegration:
    @pytest.mark.asyncio
    async def test_notification_flow(self):
        from services.notifier-service.src.notifier import NotifierService

        notifier = NotifierService()
        event = {
            "session_id": "test-session",
            "customer_id": "test-customer",
            "event_type": "CREATED",
        }
        await notifier.notify_lawyers(event)


class TestSearchIndexerIntegration:
    @pytest.mark.asyncio
    async def test_indexing_flow(self):
        from services.search-indexer.src.indexer import SearchIndexer

        indexer = SearchIndexer("http://localhost:7700", "")
        event = {
            "session_id": "test-session",
            "customer_id": "test-customer",
            "legal_domain": "civil",
            "event_type": "CREATED",
            "status": "OPEN",
        }
        await indexer.index_consultation(event)
