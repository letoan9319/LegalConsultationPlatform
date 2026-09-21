import httpx
from typing import Dict
import structlog

logger = structlog.get_logger()


class AlertManager:
    def __init__(self, webhook_url: str = ""):
        self.webhook_url = webhook_url

    async def send_alert(
        self,
        service: str,
        metrics: Dict,
        anomaly_score: float,
        details: Dict,
    ):
        alert = {
            "service": service,
            "metrics": metrics,
            "anomaly_score": anomaly_score,
            "contributing_features": details.get("contributing_features", []),
            "severity": self._calculate_severity(anomaly_score),
        }

        logger.warning("anomaly_detected", **alert)

        if self.webhook_url:
            try:
                async with httpx.AsyncClient() as client:
                    await client.post(self.webhook_url, json=alert, timeout=10.0)
            except Exception as e:
                logger.error("alert_webhook_failed", error=str(e))

    def _calculate_severity(self, score: float) -> str:
        if score > 0.9:
            return "critical"
        elif score > 0.8:
            return "high"
        elif score > 0.7:
            return "medium"
        return "low"
