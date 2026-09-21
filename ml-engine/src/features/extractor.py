import pandas as pd
import numpy as np
from typing import List, Dict


class TelemetryFeatureExtractor:
    def __init__(self):
        self.feature_names = [
            'msg_latency_p99_ms',
            'ai_confidence',
            'ai_response_time_ms',
            'active_sessions',
            'msg_throughput',
            'error_rate'
        ]

    def extract(self, metrics: List[Dict]) -> pd.DataFrame:
        df = pd.DataFrame(metrics)
        df['msg_latency_p99_ms'] = df['metrics'].apply(lambda x: x.get('msg_latency_p99_ms', 0))
        df['ai_confidence'] = df['metrics'].apply(lambda x: x.get('ai_confidence', 0))
        df['ai_response_time_ms'] = df['metrics'].apply(lambda x: x.get('ai_response_time_ms', 0))
        df['active_sessions'] = df['metrics'].apply(lambda x: x.get('active_sessions', 0))
        df['msg_throughput'] = df['metrics'].apply(lambda x: x.get('msg_throughput', 0))
        df['error_rate'] = df['metrics'].apply(lambda x: x.get('error_rate', 0))

        df['latency_normalized'] = df['msg_latency_p99_ms'] / 100
        df['error_rate_squared'] = df['error_rate'] ** 2
        df['throughput_log'] = np.log1p(df['msg_throughput'])
        df['confidence_inverse'] = 1 - df['ai_confidence']

        df = df.sort_values('timestamp')
        for col in ['msg_latency_p99_ms', 'error_rate', 'msg_throughput']:
            df[f'{col}_rolling_mean'] = df[col].rolling(5, min_periods=1).mean()
            df[f'{col}_rolling_std'] = df[col].rolling(5, min_periods=1).std().fillna(0)

        return df[self.get_feature_names()]

    def get_feature_names(self) -> List[str]:
        return [
            'msg_latency_p99_ms', 'ai_confidence', 'ai_response_time_ms',
            'active_sessions', 'msg_throughput', 'error_rate',
            'latency_normalized', 'error_rate_squared', 'throughput_log',
            'confidence_inverse',
            'msg_latency_p99_ms_rolling_mean', 'msg_latency_p99_ms_rolling_std',
            'error_rate_rolling_mean', 'error_rate_rolling_std',
            'msg_throughput_rolling_mean', 'msg_throughput_rolling_std'
        ]
