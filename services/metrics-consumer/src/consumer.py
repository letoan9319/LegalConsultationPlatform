from aiokafka import AIOKafkaConsumer
from .anomaly_detector import AnomalyDetector
from .alert_manager import AlertManager
from .config import get_settings
import json
import structlog
import numpy as np
from datetime import datetime
from typing import Optional, Dict, List

logger = structlog.get_logger()


class MetricsConsumer:
    def __init__(self):
        self.settings = get_settings()
        self.consumer: Optional[AIOKafkaConsumer] = None
        self.anomaly_detector = AnomalyDetector(
            model_path=self.settings.anomaly_model_path,
            threshold=self.settings.anomaly_threshold,
        )
        self.alert_manager = AlertManager(webhook_url=self.settings.alert_webhook_url)
        self.metrics_buffer: Dict[str, List[dict]] = {}
        self.buffer_window_seconds = self.settings.buffer_window_seconds

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            "telemetry.metrics",
            bootstrap_servers=self.settings.kafka_bootstrap_servers,
            group_id=self.settings.kafka_group_id,
            enable_auto_commit=False,
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        )
        await self.consumer.start()
        await self.anomaly_detector.load_model()
        logger.info("metrics_consumer_started")

    async def consume(self):
        try:
            async for msg in self.consumer:
                event = msg.value
                await self._buffer_metrics(event)

                if self._is_window_complete():
                    await self._run_anomaly_detection()
                    self._clear_buffer()

                await self.consumer.commit()

        except Exception as e:
            logger.error("consumer_error", error=str(e))
            raise

    async def _buffer_metrics(self, event: dict):
        service = event.get("service", "unknown")
        timestamp = datetime.fromisoformat(event.get("timestamp", datetime.utcnow().isoformat()))

        if service not in self.metrics_buffer:
            self.metrics_buffer[service] = []

        self.metrics_buffer[service].append({"timestamp": timestamp, "metrics": event.get("metrics", {}), "raw_event": event})

    def _is_window_complete(self) -> bool:
        for service, buffer in self.metrics_buffer.items():
            if buffer:
                latest = buffer[-1]["timestamp"]
                earliest = buffer[0]["timestamp"]
                if (latest - earliest).total_seconds() >= self.buffer_window_seconds:
                    return True
        return False

    async def _run_anomaly_detection(self):
        for service, metrics_list in self.metrics_buffer.items():
            aggregated = self._aggregate_metrics(metrics_list)
            features = self._extract_features(aggregated)

            is_anomaly, score, details = await self.anomaly_detector.detect(features)

            if is_anomaly:
                await self.alert_manager.send_alert(service, aggregated, score, details)

    def _aggregate_metrics(self, metrics_list: list) -> dict:
        if not metrics_list:
            return {}

        aggregated = {}
        metric_names = list(metrics_list[0]["metrics"].keys())

        for name in metric_names:
            values = [m["metrics"].get(name, 0) for m in metrics_list]
            aggregated[f"{name}_mean"] = np.mean(values) if values else 0
            aggregated[f"{name}_std"] = np.std(values) if values else 0
            aggregated[f"{name}_p99"] = np.percentile(values, 99) if values else 0

        return aggregated

    def _extract_features(self, aggregated: dict) -> list:
        feature_names = [
            "msg_latency_p99_ms",
            "ai_confidence",
            "ai_response_time_ms",
            "active_sessions",
            "msg_throughput",
            "error_rate",
        ]
        return [aggregated.get(f"{name}_mean", 0) for name in feature_names]

    def _clear_buffer(self):
        self.metrics_buffer = {}

    async def stop(self):
        if self.consumer:
            await self.consumer.stop()
        logger.info("metrics_consumer_stopped")
