from fastapi import FastAPI
from contextlib import asynccontextmanager
from .config import settings
from .db.connection import engine
from .redis.connection import init_redis, close_redis
from .kafka.manager import init_kafka, close_kafka
from .ws.manager import ConnectionManager, init_manager
from .api.routes import sessions, messages
from .ws.handlers import router as ws_router
import redis.asyncio as redis


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_redis(settings.redis_url)
    ws_manager = ConnectionManager(redis.from_url(settings.redis_url, decode_responses=True))
    init_manager(ws_manager)
    await init_kafka(settings.kafka_bootstrap_servers, settings.schema_registry_url)

    yield

    # Shutdown
    await close_kafka()
    await ws_manager.close()
    await close_redis()


app = FastAPI(
    title=settings.app_name,
    lifespan=lifespan,
)

# Include routers
app.include_router(sessions.router, prefix=settings.api_prefix)
app.include_router(messages.router, prefix=settings.api_prefix)
app.include_router(ws_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/")
async def root():
    return {"message": "Legal Consultation Chat Service", "version": "1.0.0"}
