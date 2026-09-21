from contextlib import asynccontextmanager
from .producer import LegalKafkaProducer

kafka_producer: LegalKafkaProducer = None


async def init_kafka(bootstrap_servers: str, schema_registry_url: str):
    global kafka_producer
    kafka_producer = LegalKafkaProducer(bootstrap_servers, schema_registry_url)
    await kafka_producer.start()


async def close_kafka():
    global kafka_producer
    if kafka_producer:
        await kafka_producer.stop()


@asynccontextmanager
async def get_kafka_producer():
    yield kafka_producer
