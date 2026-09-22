from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, ForeignKey, Text, ARRAY, Boolean, Numeric
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum


class Base(DeclarativeBase):
    pass


class UserRole(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    LAWYER = "LAWYER"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    license_number = Column(String(50), nullable=True)
    specializations = Column(ARRAY(String), default=[])
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.email}>"
