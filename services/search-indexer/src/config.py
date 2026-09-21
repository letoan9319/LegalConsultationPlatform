from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_group_id: str = "search-indexer"
    schema_registry_url: str = "http://localhost:8081"
    meilisearch_url: str = "http://localhost:7700"
    meilisearch_api_key: str = ""

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
