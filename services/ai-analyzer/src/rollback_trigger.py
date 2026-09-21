from kubernetes import client
from mlflow.tracking import MlflowClient
import structlog
import os

logger = structlog.get_logger()


class MLRollbackTrigger:
    def __init__(self):
        self.arog_rollouts_client = None
        self.mlflow_client = None

    async def initialize(self):
        try:
            from kubernetes import config
            try:
                config.load_incluster_config()
            except ImportError:
                config.load_kube_config()
            self.arog_rollouts_client = client.CustomObjectsApi()
        except Exception as e:
            logger.warning("kubernetes_config_failed", error=str(e))

        mlflow_uri = os.environ.get("MLFLOW_TRACKING_URI", "http://mlflow:5000")
        try:
            self.mlflow_client = MlflowClient(tracking_uri=mlflow_uri)
        except Exception as e:
            logger.warning("mlflow_client_failed", error=str(e))

    async def check_and_rollback(self, rollout_name: str, namespace: str) -> bool:
        severity = await self._check_anomaly(rollout_name)
        if severity == 'CRITICAL':
            logger.warning("critical_anomaly_detected", rollout=rollout_name)
            await self._abort_rollout(rollout_name, namespace)
            return True
        return False

    async def _check_anomaly(self, rollout_name: str) -> str:
        return 'NORMAL'

    async def _abort_rollout(self, rollout_name: str, namespace: str):
        if not self.arog_rollouts_client:
            return
        body = {"spec": {"abort": True}}
        self.arog_rollouts_client.patch_namespaced_custom_object(
            group="argoproj.io",
            version="v1alpha1",
            namespace=namespace,
            plural="rollouts",
            name=rollout_name,
            body=body
        )
        logger.info("rollout_aborted", rollout=rollout_name, namespace=namespace)
