import mlflow
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split
import joblib
from typing import Tuple, Dict
import pandas as pd


class IsolationForestTrainer:
    def __init__(self, config: dict):
        self.config = config
        self.model = None

    def train(self, X: pd.DataFrame, y: pd.Series = None) -> Dict:
        mlflow.set_experiment(self.config['mlflow']['experiment_name'])
        with mlflow.start_run(run_name='isolation_forest_training'):
            mlflow.log_params({
                'algorithm': self.config['model']['algorithm'],
                'contamination': self.config['model']['contamination'],
                'n_estimators': self.config['model']['n_estimators'],
                'random_state': self.config['model']['random_state'],
            })

            X_train, X_test = train_test_split(
                X, test_size=self.config['training']['test_split'],
                random_state=self.config['model']['random_state']
            )

            self.model = IsolationForest(
                contamination=self.config['model']['contamination'],
                n_estimators=self.config['model']['n_estimators'],
                random_state=self.config['model']['random_state'],
                n_jobs=-1,
                verbose=1
            )
            self.model.fit(X_train)

            train_score = self.model.score_samples(X_train)
            test_score = self.model.score_samples(X_test)

            mlflow.log_metrics({
                'train_mean_score': float(train_score.mean()),
                'test_mean_score': float(test_score.mean()),
            })

            model_path = '/tmp/isolation_forest_model.pkl'
            joblib.dump(self.model, model_path)
            mlflow.log_artifact(model_path)
            mlflow.sklearn.log_model(self.model, 'model')

        return {
            'model': self.model,
            'train_score': train_score.mean(),
            'test_score': test_score.mean(),
            'run_id': mlflow.active_run().info.run_id
        }

    def predict(self, X: pd.DataFrame) -> Tuple[pd.Series, pd.Series]:
        predictions = self.model.predict(X)
        scores = self.model.score_samples(X)
        labels = (predictions == -1).astype(int)
        return labels, scores
