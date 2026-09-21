from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_group_id: str = "audit-log-consumer"
    schema_registry_url: str = "http://localhost:8081"
    database_url: str = "postgresql+asyncpg://user:pass@localhost:5432/legaldb"
    dlq_bootstrap_servers: str = "localhost:9092"
    enable_auto_commit: bool = False
    auto_offset_reset: str = "earliest"
    isolation_level: str = "read_committed"
    max_poll_records: int = 100
    session_timeout_ms: int = 30000
    heartbeat_interval_ms: int = 10000

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
