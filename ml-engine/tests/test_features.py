import pytest
from ml_engine.src.features.extractor import TelemetryFeatureExtractor


class TestTelemetryFeatureExtractor:
    def test_feature_extraction(self):
        extractor = TelemetryFeatureExtractor()
        metrics = [
            {'timestamp': '2024-01-01T10:00:00Z', 'metrics': {'msg_latency_p99_ms': 50, 'ai_confidence': 0.9, 'ai_response_time_ms': 100, 'active_sessions': 10, 'msg_throughput': 100, 'error_rate': 0.01}},
            {'timestamp': '2024-01-01T10:01:00Z', 'metrics': {'msg_latency_p99_ms': 200, 'ai_confidence': 0.5, 'ai_response_time_ms': 500, 'active_sessions': 20, 'msg_throughput': 50, 'error_rate': 0.05}},
        ]
        features = extractor.extract(metrics)
        assert features.shape[0] == 2
        assert features.shape[1] == 16

    def test_feature_names(self):
        extractor = TelemetryFeatureExtractor()
        names = extractor.get_feature_names()
        assert len(names) == 16
        assert 'msg_latency_p99_ms' in names
        assert 'error_rate' in names
