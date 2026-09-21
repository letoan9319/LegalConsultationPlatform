import asyncio
import structlog

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)

logger = structlog.get_logger()


async def main():
    from .rollback_trigger import MLRollbackTrigger
    trigger = MLRollbackTrigger()
    await trigger.initialize()
    logger.info("ai_analyzer_started")
    
    try:
        while True:
            await asyncio.sleep(60)
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    asyncio.run(main())
