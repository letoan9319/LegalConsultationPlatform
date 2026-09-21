import asyncpg
from typing import Optional
from datetime import datetime


class AuditDBWriter:
    def __init__(self, database_url: str):
        self.database_url = database_url.replace("postgresql+asyncpg://", "")
        self._pool: Optional[asyncpg.Pool] = None

    async def start(self):
        self._pool = await asyncpg.create_pool(
            self.database_url,
            min_size=5,
            max_size=10,
        )

    async def write_audit_event(self, event: dict) -> None:
        if not self._pool:
            raise RuntimeError("Database pool not initialized")

        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO audit_log (
                    event_id, event_type, user_id, user_role,
                    session_id, resource_type, resource_id, action,
                    ip_address, user_agent, content_hash, result,
                    error_code, event_timestamp, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
                ON CONFLICT (event_id) DO NOTHING
                """,
                event.get("event_id"),
                event.get("event_type"),
                event.get("user_id"),
                event.get("user_role"),
                event.get("session_id"),
                event.get("resource_type", "unknown"),
                event.get("resource_id"),
                event.get("action"),
                event.get("ip_address"),
                event.get("user_agent"),
                event.get("content_hash"),
                event.get("result", "SUCCESS"),
                event.get("error_code"),
                datetime.fromisoformat(event.get("timestamp", datetime.utcnow().isoformat()))
            )

    async def close(self):
        if self._pool:
            await self._pool.close()
