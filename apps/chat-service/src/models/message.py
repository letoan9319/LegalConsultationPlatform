from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, ForeignKey, Numeric
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
    ASSIGNED = "ASSIGNED"
    STARTED = "STARTED"
    WAITING_PAYMENT = "WAITING_PAYMENT"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"
    ESCALATED = "ESCALATED"


class PricingType(str, enum.Enum):
    FREE = "FREE"
    PAID_HOURLY = "PAID_HOURLY"
    PAID_FIXED = "PAID_FIXED"
    SUBSCRIPTION = "SUBSCRIPTION"


class ConsultationSession(Base):
    __tablename__ = "consultation_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    lawyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    legal_domain = Column(SQLEnum(LegalDomain), nullable=False)
    status = Column(SQLEnum(SessionStatus), nullable=False, default=SessionStatus.CREATED)
    session_type = Column(SQLEnum(SessionType), nullable=False, default=SessionType.INITIAL)
    pricing_type = Column(SQLEnum(PricingType), nullable=True)
    price_amount = Column(Numeric(12, 2), nullable=True)
    price_currency = Column(String(3), default="VND")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("User", foreign_keys=[customer_id])
    lawyer = relationship("User", foreign_keys=[lawyer_id])
    messages = relationship("ChatMessage", back_populates="session", order_by="ChatMessage.created_at")

    def __repr__(self):
        return f"<ConsultationSession {self.id}>"
