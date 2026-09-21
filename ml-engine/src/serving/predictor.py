import joblib
import numpy as np
from typing import Dict, List, Tuple
from ..features.extractor import TelemetryFeatureExtractor


class AnomalyPredictor:
    def __init__(self, model_path: str):
        self.model = joblib.load(model_path)
        self.feature_extractor = TelemetryFeatureExtractor()
        self.threshold = None

    def predict(self, metrics: List[Dict]) -> Tuple[np.ndarray, np.ndarray]:
        features = self.feature_extractor.extract(metrics)
        predictions = self.model.predict(features)
        scores = self.model.score_samples(features)
        return predictions, scores

    def is_anomaly(self, metrics: List[Dict], threshold: float = None) -> bool:
        predictions, scores = self.predict(metrics)
        thresh = threshold or self.threshold
        if thresh is not None:
            return any(scores < thresh)
        return any(predictions == -1)

    def get_severity(self, scores: np.ndarray) -> str:
        if len(scores) == 0:
            return 'NORMAL'
        min_score = scores.min()
        if min_score < -0.5:
            return 'CRITICAL'
        elif min_score < -0.3:
            return 'WARNING'
        elif min_score < -0.1:
            return 'INFO'
        return 'NORMAL'
