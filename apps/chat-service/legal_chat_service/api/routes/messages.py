from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from ...db.connection import get_db
from ...db.repositories import MessageRepository, SessionRepository
from ...models import User, UserRole, SenderType, ContentType
from ...api.dependencies import get_current_user
from ...kafka.manager import get_kafka_producer
from ...ws.manager import get_manager
from pydantic import BaseModel

router = APIRouter(prefix="/sessions/{session_id}/messages", tags=["messages"])


class SendMessageRequest(BaseModel):
    content: str
    content_type: ContentType = ContentType.TEXT


@router.post("/", status_code=status.HTTP_201_CREATED)
async def send_message(
    session_id: str,
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session_repo = SessionRepository(db)
    session = await session_repo.get_by_id(UUID(session_id))

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Authorization: check user is part of this session
    if session.customer_id != current_user.id and session.lawyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this session")

    # Determine sender type
    if current_user.role == UserRole.CUSTOMER:
        sender_type = SenderType.CUSTOMER
    elif current_user.role == UserRole.LAWYER:
        sender_type = SenderType.LAWYER
    else:
        sender_type = SenderType.SYSTEM

    # Create message
    msg_repo = MessageRepository(db)
    message = await msg_repo.create(
        {
            "session_id": UUID(session_id),
            "sender_type": sender_type,
            "sender_id": current_user.id,
            "content": request.content,
            "content_type": request.content_type,
        }
    )
    await db.commit()

    # Publish to Kafka
    async with get_kafka_producer() as producer:
        await producer.send_chat_message(
            message_id=str(message.id),
            session_id=session_id,
            sender_type=sender_type.value,
            sender_id=str(current_user.id),
            content=request.content,
            content_type=request.content_type.value,
        )

    # Broadcast via WebSocket
    manager = get_manager()
    if manager:
        await manager.broadcast_to_session(
            session_id,
            {
                "type": "chat_message",
                "message_id": str(message.id),
                "sender_type": sender_type.value,
                "sender_id": str(current_user.id),
                "content": request.content,
                "content_type": request.content_type.value,
                "timestamp": message.created_at.isoformat(),
            },
        )

    return {"message_id": str(message.id), "timestamp": message.created_at}


@router.get("/")
async def get_messages(
    session_id: str,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session_repo = SessionRepository(db)
    session = await session_repo.get_by_id(UUID(session_id))

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Authorization: check user is part of this session
    if session.customer_id != current_user.id and session.lawyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this session")

    msg_repo = MessageRepository(db)
    messages = await msg_repo.get_by_session(UUID(session_id), limit, offset)

    return {
        "messages": [
            {
                "id": str(m.id),
                "sender_type": m.sender_type.value,
                "sender_id": str(m.sender_id) if m.sender_id else None,
                "content": m.content,
                "content_type": m.content_type.value,
                "timestamp": m.created_at.isoformat(),
            }
            for m in messages
        ],
        "total": len(messages),
    }
