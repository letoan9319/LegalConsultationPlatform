import asyncio
from .consumer import NotifierConsumer
import structlog

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)


async def main():
    consumer = NotifierConsumer()

    try:
        await consumer.start()
        await consumer.consume()
    except KeyboardInterrupt:
        pass
    finally:
        await consumer.stop()


if __name__ == "__main__":
    asyncio.run(main())
