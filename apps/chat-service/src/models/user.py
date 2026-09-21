from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, ForeignKey, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from .user import Base


class SenderType(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    LAWYER = "LAWYER"
    AI_ASSISTANT = "AI_ASSISTANT"
    SYSTEM = "SYSTEM"


class ContentType(str, enum.Enum):
    TEXT = "TEXT"
    IMAGE = "IMAGE"
    DOCUMENT = "DOCUMENT"
    LINK = "LINK"
    SYSTEM_EVENT = "SYSTEM_EVENT"


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("consultation_sessions.id"), nullable=False)
    sender_type = Column(SQLEnum(SenderType), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    content = Column(Text, nullable=False)
    content_type = Column(SQLEnum(ContentType), default=ContentType.TEXT)
    attachments = Column(ARRAY(String), default=[])
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    session = relationship("ConsultationSession", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage {self.id}>"
