import pytest
from training.isolation_forest import IsolationForestTrainer


class TestIsolationForestTrainer:
    def test_trainer_initialization(self):
        config = {
            'mlflow': {'experiment_name': 'test'},
            'model': {'contamination': 0.1, 'n_estimators': 10, 'random_state': 42},
            'training': {'test_split': 0.2}
        }
        trainer = IsolationForestTrainer(config)
        assert trainer.config == config
        assert trainer.model is None
