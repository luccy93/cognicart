from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.database import get_db
from app.models.enterprise import SavedCard, Refund, RefundStatus
from app.models.additional import Payment
from app.models.order import Order
from app.schemas.enterprise import SavedCardResponse, RefundCreate, RefundResponse
from app.auth.jwt import get_current_user, require_admin

router = APIRouter(prefix="/api/payments", tags=["Payments"])


@router.get("/cards", response_model=List[SavedCardResponse])
async def list_cards(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(SavedCard).where(SavedCard.user_id == current_user["user_id"])
        .order_by(SavedCard.is_default.desc(), SavedCard.created_at.desc())
    )
    cards = result.scalars().all()
    return cards


@router.post("/cards", response_model=SavedCardResponse, status_code=201)
async def save_card(
    gateway: str,
    card_last_four: str,
    card_brand: str,
    card_holder_name: str,
    expiry_month: int,
    expiry_year: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    card = SavedCard(
        id=uuid4(),
        user_id=current_user["user_id"],
        gateway=gateway,
        card_last_four=card_last_four,
        card_brand=card_brand,
        card_holder_name=card_holder_name,
        expiry_month=expiry_month,
        expiry_year=expiry_year
    )

    # Set as default if first card
    existing = await db.execute(
        select(func.count()).select_from(SavedCard).where(SavedCard.user_id == current_user["user_id"])
    )
    if existing.scalar() == 0:
        card.is_default = True

    db.add(card)
    await db.commit()
    await db.refresh(card)
    return card


@router.delete("/cards/{card_id}", status_code=204)
async def delete_card(
    card_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(SavedCard).where(SavedCard.id == card_id, SavedCard.user_id == current_user["user_id"])
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    await db.delete(card)
    await db.commit()


@router.put("/cards/{card_id}/default")
async def set_default_card(
    card_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(SavedCard).where(SavedCard.user_id == current_user["user_id"])
    )
    cards = result.scalars().all()
    target = None
    for c in cards:
        if c.id == card_id:
            target = c
            c.is_default = True
        else:
            c.is_default = False
    if not target:
        raise HTTPException(status_code=404, detail="Card not found")
    await db.commit()
    return {"message": "Default card updated"}


@router.get("/refunds", response_model=dict)
async def list_refunds(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    conditions = [Refund.user_id == current_user["user_id"]]

    total_q = await db.execute(
        select(func.count()).select_from(Refund).where(*conditions)
    )
    total = total_q.scalar()

    result = await db.execute(
        select(Refund).where(*conditions)
        .order_by(Refund.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    refunds = result.scalars().all()

    return {"items": refunds, "total": total, "page": page, "page_size": page_size}


@router.post("/refunds", response_model=RefundResponse, status_code=201)
async def initiate_refund(
    data: RefundCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order_result = await db.execute(select(Order).where(Order.id == data.order_id))
    order = order_result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    payment_result = await db.execute(
        select(Payment).where(Payment.order_id == data.order_id).limit(1)
    )
    payment = payment_result.scalar_one_or_none()

    refund = Refund(
        id=uuid4(),
        order_id=data.order_id,
        payment_id=payment.id if payment else None,
        user_id=current_user["user_id"],
        amount=data.amount,
        reason=data.reason,
        status=RefundStatus.PENDING,
        initiated_by=current_user["user_id"]
    )
    db.add(refund)
    await db.commit()
    await db.refresh(refund)
    return refund


@router.post("/refunds/{refund_id}/approve", response_model=RefundResponse)
async def approve_refund(
    refund_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(select(Refund).where(Refund.id == refund_id))
    refund = result.scalar_one_or_none()
    if not refund:
        raise HTTPException(status_code=404, detail="Refund not found")
    refund.status = RefundStatus.APPROVED
    await db.commit()
    await db.refresh(refund)
    return refund


@router.post("/refunds/{refund_id}/process", response_model=RefundResponse)
async def process_refund(
    refund_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(select(Refund).where(Refund.id == refund_id))
    refund = result.scalar_one_or_none()
    if not refund:
        raise HTTPException(status_code=404, detail="Refund not found")
    refund.status = RefundStatus.COMPLETED
    refund.processed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(refund)
    return refund


@router.get("/transactions", response_model=dict)
async def list_payment_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    total_q = await db.execute(
        select(func.count()).select_from(Payment).where(Payment.user_id == current_user["user_id"])
    )
    total = total_q.scalar()

    result = await db.execute(
        select(Payment).where(Payment.user_id == current_user["user_id"])
        .order_by(Payment.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    transactions = result.scalars().all()

    return {"items": transactions, "total": total, "page": page, "page_size": page_size}
