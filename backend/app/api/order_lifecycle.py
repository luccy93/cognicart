from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.enterprise import (
    ReturnRequest, ReturnRequestStatus, OrderTimeline
)
from app.schemas.enterprise import (
    ReturnRequestCreate, ReturnRequestResponse,
    CancelOrderResponse, OrderTimelineResponse
)
from app.auth.jwt import get_current_user, require_admin

router = APIRouter(prefix="/api/orders", tags=["Order Lifecycle"])


@router.post("/{order_id}/cancel", response_model=CancelOrderResponse)
async def cancel_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    if order.status in ("shipped", "delivered", "cancelled"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel order in '{order.status}' status")

    order.status = OrderStatus.CANCELLED
    if order.payment_status == PaymentStatus.COMPLETED:
        order.payment_status = PaymentStatus.REFUNDED

    timeline = OrderTimeline(
        id=uuid4(),
        order_id=order.id,
        status="cancelled",
        note="Order cancelled by user",
        created_by="user"
    )
    db.add(timeline)
    await db.commit()

    return CancelOrderResponse(
        message="Order cancelled successfully",
        refund_status="refunded" if order.payment_status == PaymentStatus.REFUNDED else "pending"
    )


@router.post("/{order_id}/return", response_model=ReturnRequestResponse, status_code=201)
async def initiate_return(
    order_id: UUID,
    data: ReturnRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order_result = await db.execute(select(Order).where(Order.id == order_id))
    order = order_result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if order.status != "delivered":
        raise HTTPException(status_code=400, detail="Cannot return an order that has not been delivered")

    item_check = await db.execute(
        select(OrderItem).where(OrderItem.id == data.order_item_id, OrderItem.order_id == order_id)
    )
    if not item_check.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Order item not found in this order")

    return_req = ReturnRequest(
        id=uuid4(),
        order_id=order_id,
        order_item_id=data.order_item_id,
        user_id=current_user["user_id"],
        reason=data.reason,
        status=ReturnRequestStatus.PENDING,
        pickup_address=data.pickup_address or order.shipping_address
    )
    db.add(return_req)
    await db.commit()
    await db.refresh(return_req)
    return return_req


@router.get("/returns", response_model=List[ReturnRequestResponse])
async def list_returns(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(ReturnRequest).where(ReturnRequest.user_id == current_user["user_id"])
        .order_by(ReturnRequest.created_at.desc())
    )
    return result.scalars().all()


@router.get("/returns/{return_id}", response_model=ReturnRequestResponse)
async def get_return(
    return_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(ReturnRequest).where(ReturnRequest.id == return_id))
    ret = result.scalar_one_or_none()
    if not ret:
        raise HTTPException(status_code=404, detail="Return request not found")
    if ret.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    return ret


@router.put("/returns/{return_id}/status", response_model=ReturnRequestResponse)
async def update_return_status(
    return_id: UUID,
    status: str,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(select(ReturnRequest).where(ReturnRequest.id == return_id))
    ret = result.scalar_one_or_none()
    if not ret:
        raise HTTPException(status_code=404, detail="Return request not found")

    ret.status = ReturnRequestStatus(status)
    ret.updated_at = datetime.now(timezone.utc)
    if status == "picked_up":
        ret.pickup_completed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(ret)
    return ret


@router.get("/{order_id}/timeline", response_model=List[OrderTimelineResponse])
async def get_order_timeline(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db.execute(
        select(OrderTimeline).where(OrderTimeline.order_id == order_id)
        .order_by(OrderTimeline.created_at.asc())
    )
    return result.scalars().all()


@router.post("/{order_id}/timeline", response_model=OrderTimelineResponse, status_code=201)
async def add_timeline_entry(
    order_id: UUID,
    status: str,
    note: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    timeline = OrderTimeline(
        id=uuid4(),
        order_id=order_id,
        status=status,
        note=note,
        created_by="admin"
    )
    db.add(timeline)

    order.status = OrderStatus(status) if status in [s.value for s in OrderStatus] else order.status
    await db.commit()
    await db.refresh(timeline)
    return timeline


@router.post("/returns/{return_id}/schedule-pickup")
async def schedule_pickup(
    return_id: UUID,
    pickup_at: datetime,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(ReturnRequest).where(ReturnRequest.id == return_id))
    ret = result.scalar_one_or_none()
    if not ret:
        raise HTTPException(status_code=404, detail="Return request not found")
    if ret.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    ret.pickup_scheduled_at = pickup_at
    ret.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "Pickup scheduled", "scheduled_at": pickup_at.isoformat()}
