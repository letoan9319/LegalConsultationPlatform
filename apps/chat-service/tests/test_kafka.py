import pytest
from app.kafka.producer import LegalKafkaProducer


@pytest.mark.asyncio
async def test_kafka_producer_init():
    producer = LegalKafkaProducer(
        bootstrap_servers="localhost:9092",
        schema_registry_url="http://localhost:8081",
    )
    assert producer.bootstrap_servers == "localhost:9092"
    assert producer.schema_registry_url == "http://localhost:8081"
