from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from .user import Base


class LegalDomain(str, enum.Enum):
    CIVIL = "CIVIL"
    CRIMINAL = "CRIMINAL"
    LAND = "LAND"
    LABOR = "LABOR"
    COMMERCIAL = "COMMERCIAL"
    FAMILY = "FAMILY"
    INTELLECTUAL = "INTELLECTUAL"
    TAX = "TAX"
    ADMINISTRATIVE = "ADMINISTRATIVE"
    INSURANCE = "INSURANCE"


class SessionType(str, enum.Enum):
    INITIAL = "INITIAL"
    FOLLOWUP = "FOLLOWUP"
    EMERGENCY = "EMERGENCY"


class SessionStatus(str, enum.Enum):
    CREATED = "CREATED"
    WAITING = "WAITING"
    IN_PROGRESS = "IN_PROGRESS"
    WAITING_PAYMENT = "WAITING_PAYMENT"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class PricingType(str, enum.Enum):
    FREE = "FREE"
    PER_MINUTE = "PER_MINUTE"
    FIXED = "FIXED"
    SUBSCRIPTION = "SUBSCRIPTION"


class ConsultationSession(Base):
    __tablename__ = "consultation_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), nullable=False)
    lawyer_id = Column(UUID(as_uuid=True), nullable=True)
    legal_domain = Column(SQLEnum(LegalDomain), nullable=False)
    session_type = Column(SQLEnum(SessionType), default=SessionType.INITIAL)
    status = Column(SQLEnum(SessionStatus), default=SessionStatus.CREATED)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    initial_question = Column(Text, nullable=True)
    pricing_type = Column(SQLEnum(PricingType), default=PricingType.FREE)
    price = Column(Numeric(10, 2), nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("User", foreign_keys=[customer_id])
    lawyer = relationship("User", foreign_keys=[lawyer_id])
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ConsultationSession {self.id}>"
