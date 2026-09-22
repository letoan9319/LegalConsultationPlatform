from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from ...db.connection import get_db
from ...db.repositories import SessionRepository
from ...models import User, UserRole, SessionStatus, LegalDomain, SessionType
from ...api.dependencies import get_current_user
from ...kafka.manager import get_kafka_producer

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_session(
    legal_domain: LegalDomain,
    session_type: SessionType = SessionType.INITIAL,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = SessionRepository(db)

    session_data = {
        "customer_id": current_user.id,
        "legal_domain": legal_domain,
        "session_type": session_type,
        "status": SessionStatus.CREATED,
    }

    session = await repo.create(session_data)
    await db.commit()

    # Publish Kafka event (optional - session is already created)
    async with get_kafka_producer() as producer:
        if producer:
            await producer.send_consultation_event(
                session_id=str(session.id),
                customer_id=str(current_user.id),
                lawyer_id=None,
                event_type="CREATED",
                legal_domain=legal_domain.value,
                status=SessionStatus.CREATED.value,
            )

    return {"session_id": str(session.id), "status": session.status}


@router.get("/{session_id}")
async def get_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = SessionRepository(db)
    session = await repo.get_by_id(UUID(session_id))

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check access: allow customer, lawyer of session, or admin
    is_customer = session.customer_id == current_user.id
    is_lawyer = session.lawyer_id == current_user.id
    is_admin = current_user.role == UserRole.ADMIN

    if not (is_customer or is_lawyer or is_admin):
        raise HTTPException(status_code=403, detail="Access denied")

    return {
        "id": str(session.id),
        "customer_id": str(session.customer_id),
        "lawyer_id": str(session.lawyer_id) if session.lawyer_id else None,
        "legal_domain": session.legal_domain.value,
        "status": session.status.value,
        "session_type": session.session_type.value,
        "created_at": session.created_at.isoformat(),
    }
