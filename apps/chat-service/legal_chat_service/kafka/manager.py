from contextlib import asynccontextmanager
import structlog

from .producer import LegalKafkaProducer

kafka_producer: LegalKafkaProducer | None = None
_kafka_available = False

log = structlog.get_logger()


async def init_kafka(bootstrap_servers: str, schema_registry_url: str):
    global kafka_producer, _kafka_available
    kafka_producer = LegalKafkaProducer(bootstrap_servers, schema_registry_url)
    try:
        await kafka_producer.start()
        _kafka_available = True
        log.info("kafka_connected", bootstrap_servers=bootstrap_servers)
    except Exception as e:
        log.warning("kafka_unavailable_starting_without", error=str(e), bootstrap_servers=bootstrap_servers)
        _kafka_available = False


async def close_kafka():
    global kafka_producer
    if kafka_producer:
        await kafka_producer.stop()


@asynccontextmanager
async def get_kafka_producer():
    if kafka_producer is None or not _kafka_available:
        log.warning("kafka_producer_unavailable")
        yield None
    else:
        yield kafka_producer
