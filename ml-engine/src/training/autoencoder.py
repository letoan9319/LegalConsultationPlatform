import mlflow
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from typing import Tuple, Dict
import pandas as pd
import numpy as np


class Autoencoder(nn.Module):
    def __init__(self, input_dim: int):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 8)
        )
        self.decoder = nn.Sequential(
            nn.Linear(8, 16),
            nn.ReLU(),
            nn.Linear(16, 32),
            nn.ReLU(),
            nn.Linear(32, input_dim)
        )

    def forward(self, x):
        return self.decoder(self.encoder(x))

    def encode(self, x):
        return self.encoder(x)


class AutoencoderTrainer:
    def __init__(self, config: dict):
        self.config = config
        self.model = None
        self.threshold = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    def train(self, X: pd.DataFrame) -> Dict:
        mlflow.set_experiment(self.config['mlflow']['experiment_name'])
        with mlflow.start_run(run_name='autoencoder_training'):
            input_dim = X.shape[1]
            self.model = Autoencoder(input_dim).to(self.device)

            X_tensor = torch.FloatTensor(X.values)
            dataset = TensorDataset(X_tensor)
            dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

            optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
            criterion = nn.MSELoss()

            epochs = 100
            for epoch in range(epochs):
                total_loss = 0
                for batch in dataloader:
                    x = batch[0].to(self.device)
                    optimizer.zero_grad()
                    x_recon = self.model(x)
                    loss = criterion(x_recon, x)
                    loss.backward()
                    optimizer.step()
                    total_loss += loss.item()
                if epoch % 10 == 0:
                    mlflow.log_metric('epoch_loss', total_loss / len(dataloader), step=epoch)

            with torch.no_grad():
                X_tensor = X_tensor.to(self.device)
                reconstructions = self.model(X_tensor)
                mse = torch.mean((X_tensor - reconstructions) ** 2, dim=1)
                self.threshold = np.percentile(mse.cpu().numpy(), 95)
                mlflow.log_metrics({
                    'mean_reconstruction_error': float(mse.mean()),
                    'threshold_p95': float(self.threshold),
                })

            torch.save(self.model.state_dict(), '/tmp/autoencoder_model.pth')
            mlflow.log_artifact('/tmp/autoencoder_model.pth')

        return {
            'model': self.model,
            'threshold': self.threshold,
            'run_id': mlflow.active_run().info.run_id
        }

    def predict(self, X: pd.DataFrame) -> Tuple[pd.Series, pd.Series]:
        self.model.eval()
        X_tensor = torch.FloatTensor(X.values).to(self.device)
        with torch.no_grad():
            reconstructions = self.model(X_tensor)
            mse = torch.mean((X_tensor - reconstructions) ** 2, dim=1)
        scores = mse.cpu().numpy()
        anomalies = scores > self.threshold
        return anomalies.astype(int), scores
