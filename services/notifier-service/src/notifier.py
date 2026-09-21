import structlog
import httpx
from typing import Optional

logger = structlog.get_logger()


class NotifierService:
    def __init__(self):
        self.smtp_config = None

    async def notify_lawyers(self, event: dict):
        session_id = event.get("session_id")
        legal_domain = event.get("legal_domain")
        customer_id = event.get("customer_id")

        logger.info(
            "notifying_lawyers",
            session_id=session_id,
            legal_domain=legal_domain,
            customer_id=customer_id,
        )

    async def notify_customer_assignment(self, event: dict):
        customer_id = event.get("customer_id")
        lawyer_id = event.get("lawyer_id")
        session_id = event.get("session_id")

        logger.info(
            "notifying_customer_assignment",
            customer_id=customer_id,
            lawyer_id=lawyer_id,
            session_id=session_id,
        )

    async def send_completion_notification(self, event: dict):
        customer_id = event.get("customer_id")
        lawyer_id = event.get("lawyer_id")
        session_id = event.get("session_id")

        logger.info(
            "sending_completion_notification",
            customer_id=customer_id,
            lawyer_id=lawyer_id,
            session_id=session_id,
        )

    async def send_push_notification(self, user_id: str, title: str, body: str, data: Optional[dict] = None):
        logger.info(
            "push_notification_sent",
            user_id=user_id,
            title=title,
            body=body,
        )
