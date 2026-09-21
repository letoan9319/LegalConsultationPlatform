import asyncio
from .consumer import MetricsConsumer
import structlog

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)


async def main():
    consumer = MetricsConsumer()

    try:
        await consumer.start()
        await consumer.consume()
    except KeyboardInterrupt:
        pass
    finally:
        await consumer.stop()


if __name__ == "__main__":
    asyncio.run(main())
