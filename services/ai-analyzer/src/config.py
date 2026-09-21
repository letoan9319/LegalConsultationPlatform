from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    mlflow_tracking_uri: str = "http://mlflow:5000"
    model_name: str = "legal-aiops-anomaly-detection"
    anomaly_threshold: float = 0.7
    kubernetes_namespace: str = "production"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
