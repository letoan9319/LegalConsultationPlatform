from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_group_id: str = "metrics-consumer"
    schema_registry_url: str = "http://localhost:8081"
    anomaly_model_path: str = "/models/anomaly_detector.pkl"
    anomaly_threshold: float = 0.7
    buffer_window_seconds: int = 30
    alert_webhook_url: str = ""

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
