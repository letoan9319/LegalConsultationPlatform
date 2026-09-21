import httpx
from typing import Optional
import structlog

logger = structlog.get_logger()


class SearchIndexer:
    def __init__(self, meilisearch_url: str, api_key: str = ""):
        self.meilisearch_url = meilisearch_url
        self.api_key = api_key

    async def index_consultation(self, event: dict):
        document = {
            "id": event.get("session_id"),
            "customer_id": event.get("customer_id"),
            "lawyer_id": event.get("lawyer_id"),
            "legal_domain": event.get("legal_domain"),
            "event_type": event.get("event_type"),
            "status": event.get("status"),
            "timestamp": event.get("timestamp"),
        }

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{self.meilisearch_url}/indexes/consultations/documents",
                    json=[document],
                    headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
                    timeout=10.0,
                )
                if resp.status_code not in (200, 202):
                    logger.error("index_consultation_failed", status=resp.status_code)
        except Exception as e:
            logger.error("index_consultation_error", error=str(e))

    async def index_chat_message(self, message: dict):
        document = {
            "id": message.get("message_id"),
            "session_id": message.get("session_id"),
            "sender_type": message.get("sender_type"),
            "sender_id": message.get("sender_id"),
            "content": message.get("content"),
            "content_type": message.get("content_type"),
            "timestamp": message.get("timestamp"),
        }

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{self.meilisearch_url}/indexes/chat_messages/documents",
                    json=[document],
                    headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
                    timeout=10.0,
                )
                if resp.status_code not in (200, 202):
                    logger.error("index_message_failed", status=resp.status_code)
        except Exception as e:
            logger.error("index_message_error", error=str(e))
