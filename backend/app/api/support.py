from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.database import get_db
from app.models.feature_extensions import SupportTicket
from app.models.enterprise import KnowledgeBase
from app.models.enterprise import TicketMessage
from app.models.user import User
from app.schemas.enterprise import (
    TicketCreate, TicketResponse,
    TicketMessageCreate, TicketMessageResponse,
    KnowledgeBaseResponse
)
from app.auth.jwt import get_current_user, require_admin

router = APIRouter(prefix="/api/support", tags=["Support"])


@router.get("/tickets", response_model=dict)
async def list_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    conditions = [SupportTicket.user_id == current_user["user_id"]]

    total_q = await db.execute(
        select(func.count()).select_from(SupportTicket).where(*conditions)
    )
    total = total_q.scalar()

    result = await db.execute(
        select(SupportTicket).where(*conditions)
        .order_by(SupportTicket.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    tickets = result.scalars().all()

    items = []
    for t in tickets:
        items.append(TicketResponse(
            id=t.id, subject=t.subject, description=t.message,
            category=t.priority, priority=t.priority,
            status=t.status, assigned_to=t.assigned_to,
            created_at=t.created_at, updated_at=t.updated_at
        ))

    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.post("/tickets", response_model=TicketResponse, status_code=201)
async def create_ticket(
    data: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    ticket = SupportTicket(
        id=uuid4(),
        user_id=current_user["user_id"],
        subject=data.subject,
        message=data.description,
        priority=data.priority,
        status="open"
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    return TicketResponse(
        id=ticket.id, subject=ticket.subject,
        description=ticket.message, category=data.category,
        priority=ticket.priority, status=ticket.status,
        assigned_to=ticket.assigned_to,
        created_at=ticket.created_at, updated_at=ticket.updated_at
    )


@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    return TicketResponse(
        id=ticket.id, subject=ticket.subject,
        description=ticket.message, category=ticket.priority,
        priority=ticket.priority, status=ticket.status,
        assigned_to=ticket.assigned_to,
        created_at=ticket.created_at, updated_at=ticket.updated_at
    )


@router.post("/tickets/{ticket_id}/messages", response_model=TicketMessageResponse, status_code=201)
async def add_ticket_message(
    ticket_id: UUID,
    data: TicketMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    ticket = await db.get(SupportTicket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    is_staff = current_user["role"] in ("admin", "super_admin")
    msg = TicketMessage(
        id=uuid4(),
        ticket_id=ticket_id,
        user_id=current_user["user_id"],
        message=data.message,
        attachment_url=data.attachment_url,
        is_staff=is_staff
    )
    db.add(msg)

    ticket.status = "in_progress" if is_staff else ticket.status
    ticket.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(msg)

    user = await db.get(User, current_user["user_id"])
    return TicketMessageResponse(
        id=msg.id, user_id=msg.user_id,
        user_name=user.full_name if user else "Unknown",
        message=msg.message, attachment_url=msg.attachment_url,
        is_staff=msg.is_staff, created_at=msg.created_at
    )


@router.get("/tickets/{ticket_id}/messages", response_model=List[TicketMessageResponse])
async def list_ticket_messages(
    ticket_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    ticket = await db.get(SupportTicket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db.execute(
        select(TicketMessage).where(TicketMessage.ticket_id == ticket_id)
        .order_by(TicketMessage.created_at.asc())
    )
    messages = result.scalars().all()

    items = []
    for m in messages:
        user = await db.get(User, m.user_id)
        items.append(TicketMessageResponse(
            id=m.id, user_id=m.user_id,
            user_name=user.full_name if user else "Unknown",
            message=m.message, attachment_url=m.attachment_url,
            is_staff=m.is_staff, created_at=m.created_at
        ))
    return items


@router.put("/tickets/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: UUID,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Only staff can update ticket status")

    ticket = await db.get(SupportTicket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = status
    ticket.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": f"Ticket status updated to {status}"}


@router.get("/knowledge-base", response_model=List[KnowledgeBaseResponse])
async def list_knowledge_base(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(KnowledgeBase).where(KnowledgeBase.is_published == True)
        .order_by(KnowledgeBase.title.asc())
    )
    articles = result.scalars().all()
    return articles


@router.get("/knowledge-base/{slug}", response_model=KnowledgeBaseResponse)
async def get_knowledge_base_article(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(KnowledgeBase).where(KnowledgeBase.slug == slug)
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.post("/knowledge-base/{slug}/vote")
async def vote_knowledge_base(
    slug: str,
    helpful: bool,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(KnowledgeBase).where(KnowledgeBase.slug == slug)
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if helpful:
        article.helpful_count += 1
    else:
        article.not_helpful_count += 1
    await db.commit()
    return {"message": "Vote recorded", "helpful_count": article.helpful_count}
