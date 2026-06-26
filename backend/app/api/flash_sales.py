from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import joinedload
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.database import get_db
from app.models.enterprise import (
    FlashSale, FlashSaleItem, DiscountType
)
from app.models.product import Product
from app.schemas.enterprise import (
    FlashSaleCreate, FlashSaleResponse, FlashSaleItemResponse
)
from app.auth.jwt import require_admin

router = APIRouter(prefix="/api/flash-sales", tags=["Flash Sales"])


@router.get("/active", response_model=List[FlashSaleResponse])
async def get_active_flash_sales(db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(FlashSale).options(joinedload(FlashSale.items).joinedload(FlashSaleItem.product))
        .where(
            FlashSale.is_active == True,
            FlashSale.starts_at <= now,
            FlashSale.ends_at >= now
        )
        .order_by(FlashSale.ends_at.asc())
    )
    sales = result.unique().scalars().all()
    return sales


@router.get("/upcoming", response_model=List[FlashSaleResponse])
async def get_upcoming_flash_sales(db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(FlashSale).options(joinedload(FlashSale.items).joinedload(FlashSaleItem.product))
        .where(
            FlashSale.is_active == True,
            FlashSale.starts_at > now
        )
        .order_by(FlashSale.starts_at.asc())
    )
    sales = result.unique().scalars().all()
    return sales


@router.get("/{sale_id}/items", response_model=List[FlashSaleItemResponse])
async def get_flash_sale_items(
    sale_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    sale = await db.get(FlashSale, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Flash sale not found")

    result = await db.execute(
        select(FlashSaleItem).options(joinedload(FlashSaleItem.product))
        .where(FlashSaleItem.flash_sale_id == sale_id)
    )
    items = result.unique().scalars().all()

    response = []
    for item in items:
        response.append(FlashSaleItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product.name if item.product else "",
            product_image=item.product.images[0].url if item.product and item.product.images else None,
            sale_price=item.sale_price,
            quantity_limit=item.quantity_limit,
            sold_count=item.sold_count
        ))
    return response


@router.post("", response_model=FlashSaleResponse, status_code=201)
async def create_flash_sale(
    data: FlashSaleCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    sale = FlashSale(
        id=uuid4(),
        title=data.title,
        description=data.description,
        banner_url=data.banner_url,
        discount_type=DiscountType(data.discount_type),
        discount_value=data.discount_value,
        starts_at=data.starts_at,
        ends_at=data.ends_at
    )
    db.add(sale)
    await db.commit()
    await db.refresh(sale)
    return sale


@router.put("/{sale_id}", response_model=FlashSaleResponse)
async def update_flash_sale(
    sale_id: UUID,
    data: FlashSaleCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(
        select(FlashSale).options(joinedload(FlashSale.items).joinedload(FlashSaleItem.product))
        .where(FlashSale.id == sale_id)
    )
    sale = result.unique().scalar_one_or_none()
    if not sale:
        raise HTTPException(status_code=404, detail="Flash sale not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(sale, key, value)
    await db.commit()
    await db.refresh(sale)
    return sale


@router.post("/{sale_id}/items", response_model=FlashSaleItemResponse, status_code=201)
async def add_flash_sale_item(
    sale_id: UUID,
    product_id: UUID,
    sale_price: float,
    quantity_limit: int = 0,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    sale = await db.get(FlashSale, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Flash sale not found")

    existing = await db.execute(
        select(FlashSaleItem).where(
            FlashSaleItem.flash_sale_id == sale_id,
            FlashSaleItem.product_id == product_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Product already in flash sale")

    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    item = FlashSaleItem(
        id=uuid4(),
        flash_sale_id=sale_id,
        product_id=product_id,
        sale_price=sale_price,
        quantity_limit=quantity_limit
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)

    return FlashSaleItemResponse(
        id=item.id,
        product_id=item.product_id,
        product_name=product.name,
        product_image=product.images[0].url if product.images else None,
        sale_price=item.sale_price,
        quantity_limit=item.quantity_limit,
        sold_count=item.sold_count
    )


@router.delete("/{sale_id}/items/{item_id}", status_code=204)
async def remove_flash_sale_item(
    sale_id: UUID,
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    result = await db.execute(
        select(FlashSaleItem).where(
            FlashSaleItem.id == item_id,
            FlashSaleItem.flash_sale_id == sale_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Flash sale item not found")
    await db.delete(item)
    await db.commit()
