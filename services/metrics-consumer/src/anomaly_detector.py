import numpy as np
from typing import Tuple, Dict, List, Optional
import os


class AnomalyDetector:
    def __init__(self, model_path: str = None, threshold: float = 0.7):
        self.model = None
        self.model_path = model_path or os.environ.get("ANOMALY_MODEL_PATH", "/models/anomaly_detector.pkl")
        self.threshold = threshold

    async def load_model(self):
        if os.path.exists(self.model_path):
            try:
                import joblib
                self.model = joblib.load(self.model_path)
            except Exception:
                self.model = None

    async def detect(self, features: List[float]) -> Tuple[bool, float, Dict]:
        if self.model:
            try:
                import joblib
                score = self.model.score_samples([features])[0]
            except Exception:
                score = self._simple_detection(features)
        else:
            score = self._simple_detection(features)

        is_anomaly = score > self.threshold

        return is_anomaly, score, {
            "contributing_features": self._get_contributing_features(features, score),
        }

    def _simple_detection(self, features: List[float]) -> float:
        error_rate_idx = 5
        error_rate = features[error_rate_idx] if len(features) > error_rate_idx else 0
        latency_idx = 0
        latency = features[latency_idx] if len(features) > latency_idx else 0
        score = min(1.0, (error_rate * 10) + (latency / 10000))
        return score

    def _get_contributing_features(self, features: List[float], score: float) -> List[str]:
        feature_names = [
            "msg_latency_p99_ms",
            "ai_confidence",
            "ai_response_time_ms",
            "active_sessions",
            "msg_throughput",
            "error_rate",
        ]

        contributing = []
        for i, name in enumerate(feature_names):
            if i < len(features) and features[i] > self._get_threshold_for_feature(name):
                contributing.append(name)
        return contributing

    def _get_threshold_for_feature(self, name: str) -> float:
        thresholds = {
            "msg_latency_p99_ms": 1000,
            "ai_confidence": 0.3,
            "ai_response_time_ms": 5000,
            "active_sessions": 1000,
            "msg_throughput": 0.1,
            "error_rate": 0.05,
        }
        return thresholds.get(name, 0.5)
