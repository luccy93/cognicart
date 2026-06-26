from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.database import get_db
from app.models.feature_extensions import PriceAlert
from app.models.product import Product
from app.schemas.enterprise import PriceAlertCreate, PriceAlertResponse
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/api/price-alerts", tags=["Price Tracking"])


@router.get("", response_model=List[PriceAlertResponse])
async def list_price_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(PriceAlert).where(PriceAlert.user_id == current_user["user_id"])
        .order_by(PriceAlert.created_at.desc())
    )
    alerts = result.scalars().all()

    response = []
    for alert in alerts:
        prod_result = await db.execute(
            select(Product).options(joinedload(Product.images)).where(Product.id == alert.product_id)
        )
        product = prod_result.unique().scalar_one_or_none()
        response.append(PriceAlertResponse(
            id=alert.id,
            product_id=alert.product_id,
            product_name=product.name if product else "",
            product_image=product.images[0].url if product and product.images else None,
            current_price=alert.current_price or (product.price if product else 0),
            target_price=alert.target_price,
            is_active=not alert.is_triggered,
            triggered=alert.is_triggered,
            created_at=alert.created_at
        ))
    return response


@router.post("", response_model=PriceAlertResponse, status_code=201)
async def create_price_alert(
    data: PriceAlertCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    product = await db.get(Product, data.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = await db.execute(
        select(PriceAlert).where(
            PriceAlert.user_id == current_user["user_id"],
            PriceAlert.product_id == data.product_id,
            PriceAlert.is_triggered == False
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You already have an active alert for this product")

    alert = PriceAlert(
        id=uuid4(),
        user_id=current_user["user_id"],
        product_id=data.product_id,
        target_price=data.target_price,
        current_price=product.price
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)

    return PriceAlertResponse(
        id=alert.id,
        product_id=alert.product_id,
        product_name=product.name,
        product_image=product.images[0].url if product.images else None,
        current_price=product.price,
        target_price=alert.target_price,
        is_active=True,
        triggered=False,
        created_at=alert.created_at
    )


@router.put("/{alert_id}", response_model=PriceAlertResponse)
async def update_price_alert(
    alert_id: UUID,
    target_price: float,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(PriceAlert).where(
            PriceAlert.id == alert_id,
            PriceAlert.user_id == current_user["user_id"]
        )
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Price alert not found")

    alert.target_price = target_price
    await db.commit()

    product = await db.get(Product, alert.product_id)
    return PriceAlertResponse(
        id=alert.id,
        product_id=alert.product_id,
        product_name=product.name if product else "",
        product_image=product.images[0].url if product and product.images else None,
        current_price=alert.current_price or (product.price if product else 0),
        target_price=alert.target_price,
        is_active=not alert.is_triggered,
        triggered=alert.is_triggered,
        created_at=alert.created_at
    )


@router.delete("/{alert_id}", status_code=204)
async def delete_price_alert(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(PriceAlert).where(
            PriceAlert.id == alert_id,
            PriceAlert.user_id == current_user["user_id"]
        )
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Price alert not found")
    await db.delete(alert)
    await db.commit()
