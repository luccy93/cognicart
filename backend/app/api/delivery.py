from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.database import get_db
from app.models.enterprise import Shipment, ShipmentStatus
from app.models.order import Order
from app.schemas.enterprise import ShipmentResponse
from app.auth.jwt import get_current_user, require_admin

router = APIRouter(prefix="/api/delivery", tags=["Delivery"])


@router.get("/shipments/{shipment_id}", response_model=ShipmentResponse)
async def get_shipment(
    shipment_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Shipment).where(Shipment.id == shipment_id))
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment


@router.get("/orders/{order_id}/shipments", response_model=List[ShipmentResponse])
async def get_order_shipments(
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
        select(Shipment).where(Shipment.order_id == order_id)
        .order_by(Shipment.created_at.desc())
    )
    return result.scalars().all()


@router.post("/orders/{order_id}/shipments", response_model=ShipmentResponse, status_code=201)
async def create_shipment(
    order_id: UUID,
    carrier: str,
    tracking_number: str,
    service_type: str = "standard",
    estimated_delivery: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    shipment = Shipment(
        id=uuid4(),
        order_id=order_id,
        carrier=carrier,
        tracking_number=tracking_number,
        service_type=service_type,
        status=ShipmentStatus.PENDING,
        shipped_at=datetime.now(timezone.utc),
        estimated_delivery=estimated_delivery
    )
    db.add(shipment)
    order.status = "shipped"
    order.tracking_number = tracking_number
    await db.commit()
    await db.refresh(shipment)
    return shipment


@router.put("/shipments/{shipment_id}/track", response_model=ShipmentResponse)
async def update_tracking(
    shipment_id: UUID,
    status: str,
    current_location: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(select(Shipment).where(Shipment.id == shipment_id))
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    shipment.status = ShipmentStatus(status) if status in [s.value for s in ShipmentStatus] else status
    if current_location:
        shipment.current_location = current_location
    if status == "delivered":
        shipment.delivered_at = datetime.now(timezone.utc)
    shipment.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(shipment)
    return shipment


@router.post("/shipments/{shipment_id}/track", response_model=ShipmentResponse)
async def add_tracking_update(
    shipment_id: UUID,
    status: str,
    current_location: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Shipment).where(Shipment.id == shipment_id))
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    shipment.status = ShipmentStatus(status) if status in [s.value for s in ShipmentStatus] else status
    if current_location:
        shipment.current_location = current_location
    if status == "delivered":
        shipment.delivered_at = datetime.now(timezone.utc)
    shipment.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(shipment)
    return shipment
