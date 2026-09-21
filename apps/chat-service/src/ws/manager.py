from fastapi import WebSocket
from typing import Dict, Set, Optional
import redis.asyncio as redis
import json
import asyncio

_manager: Optional["ConnectionManager"] = None


class ConnectionManager:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        # Map session_id -> set of websocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.pubsub: Optional[redis.client.PubSub] = None
        self.listener_task: Optional[asyncio.Task] = None

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()

        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)

        # Subscribe to Redis channel for this session
        if self.pubsub is None:
            self.pubsub = self.redis.pubsub()

        await self.pubsub.subscribe(f"session:{session_id}")

        # Start listener if not running
        if self.listener_task is None or self.listener_task.done():
            self.listener_task = asyncio.create_task(self._redis_listener())

    async def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)

            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
                if self.pubsub:
                    await self.pubsub.unsubscribe(f"session:{session_id}")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast_to_session(self, session_id: str, message: dict):
        # Send to all connected clients
        if session_id in self.active_connections:
            disconnected = set()

            for connection in self.active_connections[session_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.add(connection)

            # Clean up disconnected
            for conn in disconnected:
                self.active_connections[session_id].discard(conn)

        # Also publish to Redis for other service instances
        await self.redis.publish(f"session:{session_id}", json.dumps(message))

    async def _redis_listener(self):
        try:
            async for message in self.pubsub.listen():
                if message["type"] == "message":
                    channel = message["channel"]
                    session_id = channel.replace("session:", "")
                    data = json.loads(message["data"])

                    if session_id in self.active_connections:
                        for connection in self.active_connections[session_id]:
                            try:
                                await connection.send_json(data)
                            except Exception:
                                pass
        except asyncio.CancelledError:
            pass

    async def close(self):
        if self.listener_task:
            self.listener_task.cancel()
            try:
                await self.listener_task
            except asyncio.CancelledError:
                pass

        if self.pubsub:
            await self.pubsub.unsubscribe()
            await self.pubsub.close()


def set_manager(m: "ConnectionManager"):
    global _manager
    _manager = m


def init_manager(m: "ConnectionManager"):
    set_manager(m)


def get_manager() -> Optional["ConnectionManager"]:
    return _manager
