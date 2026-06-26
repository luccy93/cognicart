from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from typing import List
import uuid

from app.database import get_db
from app.models.additional import Coupon
from app.schemas.coupon import CouponCreate, CouponResponse, CouponValidate
from app.auth.jwt import get_current_user, require_admin

router = APIRouter(prefix="/api/coupons", tags=["Coupons"])


@router.post("/validate")
async def validate_coupon(
    data: CouponValidate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Coupon).where(Coupon.code == data.code.upper()))
    coupon = result.scalars().first()

    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    if not coupon.is_active:
        raise HTTPException(status_code=400, detail="Coupon is inactive")
    if coupon.used_count >= coupon.usage_limit:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
    if coupon.expires_at and coupon.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Coupon has expired")
    if data.order_total < coupon.min_order_value:
        raise HTTPException(status_code=400, detail=f"Minimum order value of ${coupon.min_order_value:.2f} required")

    discount = coupon.discount_value if coupon.discount_type == "fixed" else data.order_total * coupon.discount_value / 100
    if coupon.max_discount and discount > coupon.max_discount:
        discount = coupon.max_discount

    return {
        "valid": True,
        "coupon": {
            "id": str(coupon.id),
            "code": coupon.code,
            "discount_type": coupon.discount_type,
            "discount_value": coupon.discount_value,
            "discount_amount": round(discount, 2),
            "description": coupon.description,
        }
    }


@router.get("", response_model=List[CouponResponse])
async def list_coupons(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    result = await db.execute(select(Coupon).offset(skip).limit(limit))
    return result.scalars().all()


@router.post("", response_model=CouponResponse)
async def create_coupon(
    data: CouponCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    coupon = Coupon(**data.model_dump(), id=uuid.uuid4())
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon
