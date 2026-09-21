from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# Max content length to prevent abuse
MAX_CONTENT_LENGTH = 10000


@router.websocket("/ws/session/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str, token: str):
    from .manager import get_manager
    from ..api.auth import decode_token

    manager = get_manager()
    if manager is None:
        await websocket.close(code=1011, reason="Manager not initialized")
        return

    # Validate token
    if not token:
        await websocket.close(code=4001, reason="Token required")
        return

    payload = decode_token(token)
    if not payload:
        await websocket.close(code=4001, reason="Invalid token")
        return

    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=4001, reason="Invalid token payload")
        return

    # Authorization: Verify user is part of this session
    # Note: In production, query the database to verify session membership
    # For now, we trust the authenticated token and session_id match
    # Full implementation would check: session.customer_id == user_id or session.lawyer_id == user_id

    await manager.connect(websocket, session_id)

    try:
        while True:
            data = await websocket.receive_json()

            message_type = data.get("type")

            if message_type == "chat_message":
                content = data.get("content")
                # Validate and sanitize content
                if not content or not isinstance(content, str):
                    continue
                if len(content) > MAX_CONTENT_LENGTH:
                    content = content[:MAX_CONTENT_LENGTH]

                # Use server-determined sender_type from token, not client data
                sender_type = payload.get("role", "SYSTEM")

                await manager.broadcast_to_session(
                    session_id,
                    {
                        "type": "chat_message",
                        "message_id": data.get("message_id"),
                        "sender_id": user_id,
                        "sender_type": sender_type,
                        "content": content.strip(),
                        "timestamp": data.get("timestamp"),
                    },
                )
            elif message_type == "typing":
                await manager.broadcast_to_session(
                    session_id,
                    {"type": "typing", "user_id": user_id, "is_typing": data.get("is_typing", False)},
                )
            elif message_type == "read_receipt":
                await manager.broadcast_to_session(
                    session_id,
                    {"type": "read_receipt", "message_id": data.get("message_id"), "user_id": user_id},
                )

    except WebSocketDisconnect:
        await manager.disconnect(websocket, session_id)
