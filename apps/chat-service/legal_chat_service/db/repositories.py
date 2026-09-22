from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional, List
from ..models import ConsultationSession, ChatMessage, SessionStatus
from datetime import datetime
import uuid


class SessionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, session_data: dict) -> ConsultationSession:
        session_obj = ConsultationSession(**session_data)
        self.session.add(session_obj)
        await self.session.flush()
        return session_obj

    async def get_by_id(self, session_id: uuid.UUID) -> Optional[ConsultationSession]:
        result = await self.session.execute(
            select(ConsultationSession).where(ConsultationSession.id == session_id)
        )
        return result.scalar_one_or_none()

    async def update_status(self, session_id: uuid.UUID, status: SessionStatus) -> None:
        await self.session.execute(
            update(ConsultationSession)
            .where(ConsultationSession.id == session_id)
            .values(status=status, updated_at=datetime.utcnow())
        )

    async def assign_lawyer(self, session_id: uuid.UUID, lawyer_id: uuid.UUID) -> None:
        await self.session.execute(
            update(ConsultationSession)
            .where(ConsultationSession.id == session_id)
            .values(
                lawyer_id=lawyer_id,
                status=SessionStatus.ASSIGNED,
                updated_at=datetime.utcnow(),
            )
        )


class MessageRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, message_data: dict) -> ChatMessage:
        message = ChatMessage(**message_data)
        self.session.add(message)
        await self.session.flush()
        return message

    async def get_by_session(
        self, session_id: uuid.UUID, limit: int = 100, offset: int = 0
    ) -> List[ChatMessage]:
        result = await self.session.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at)
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())
