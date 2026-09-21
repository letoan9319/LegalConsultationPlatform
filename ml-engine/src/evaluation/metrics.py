from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
import numpy as np
from typing import Dict


def calculate_anomaly_metrics(y_true: np.ndarray, y_pred: np.ndarray, scores: np.ndarray) -> Dict:
    metrics = {
        'precision': precision_score(y_true, y_pred, zero_division=0),
        'recall': recall_score(y_true, y_pred, zero_division=0),
        'f1': f1_score(y_true, y_pred, zero_division=0),
        'confusion_matrix': confusion_matrix(y_true, y_pred).tolist(),
    }
    if len(np.unique(y_true)) > 1:
        metrics['roc_auc'] = roc_auc_score(y_true, scores)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    metrics['true_negatives'] = int(tn)
    metrics['false_positives'] = int(fp)
    metrics['false_negatives'] = int(fn)
    metrics['true_positives'] = int(tp)
    return metrics


def calculate_service_health_score(metrics: Dict) -> float:
    score = 100
    if metrics.get('anomalies_detected', 0) > 0:
        score -= metrics['anomalies_detected'] * 5
    if metrics.get('error_rate', 0) > 0.01:
        score -= 10
    if metrics.get('latency_p99_ms', 0) > 100:
        score -= 15
    return max(0, score)
