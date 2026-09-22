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

    # Validate sender_type from token - must be CUSTOMER or LAWYER
    sender_type = payload.get("role")
    if sender_type not in ("CUSTOMER", "LAWYER", "ADMIN"):
        await websocket.close(code=4002, reason="Invalid role in token")
        return

    # Verify user exists and is active in database
    from ..api.dependencies import get_current_user
    try:
        user = await get_current_user(user_id, db=None)  # Token already validated
        if not user:
            await websocket.close(code=4001, reason="User not found")
            return
        if not user.is_active:
            await websocket.close(code=4002, reason="User account is disabled")
            return
    except Exception:
        await websocket.close(code=4001, reason="User verification failed")
        return

    # Authorization: Verify user is part of this session via database query
    # This prevents unauthorized access to other users' sessions
    from ..db.connection import get_db
    from ..db.repositories import SessionRepository
    from uuid import UUID

    try:
        session_uuid = UUID(session_id)
    except ValueError:
        await websocket.close(code=4003, reason="Invalid session ID")
        return

    async for db in get_db():
        repo = SessionRepository(db)
        session = await repo.get_by_id(session_uuid)

        if not session:
            await websocket.close(code=4004, reason="Session not found")
            return

        # Verify user is either customer or lawyer of this session
        if str(session.customer_id) != user_id and str(session.lawyer_id or "") != user_id:
            await websocket.close(code=4003, reason="Not authorized for this session")
            return
        break

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
