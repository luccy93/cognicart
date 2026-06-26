from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.database import get_db
from app.models.enterprise import Seller, SellerPayout, PayoutStatus, PayoutMethod
from app.models.user import User
from app.models.product import Product
from app.schemas.enterprise import (
    SellerCreate, SellerUpdate, SellerResponse, SellerListResponse, SellerPayoutResponse
)
from app.auth.jwt import get_current_user, require_admin

router = APIRouter(prefix="/api/marketplace", tags=["Marketplace"])


@router.get("/sellers", response_model=SellerListResponse)
async def list_sellers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    total_q = await db.execute(
        select(func.count()).select_from(Seller).where(Seller.is_active == True)
    )
    total = total_q.scalar()

    result = await db.execute(
        select(Seller).where(Seller.is_active == True)
        .order_by(Seller.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    sellers = result.scalars().all()

    return SellerListResponse(
        items=sellers,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/sellers/{seller_id}", response_model=SellerResponse)
async def get_seller(seller_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Seller).where(Seller.id == seller_id))
    seller = result.scalar_one_or_none()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    return seller


@router.post("/sellers/register", response_model=SellerResponse, status_code=201)
async def register_seller(
    data: SellerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing = await db.execute(
        select(Seller).where(Seller.user_id == current_user["user_id"])
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User is already a seller")

    slug_check = await db.execute(
        select(Seller).where(Seller.store_slug == data.store_slug)
    )
    if slug_check.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Store slug already taken")

    seller = Seller(
        id=uuid4(),
        user_id=current_user["user_id"],
        store_name=data.store_name,
        store_slug=data.store_slug,
        description=data.description,
        gst_number=data.gst_number,
        pan_number=data.pan_number,
        business_address=data.business_address,
        bank_account=data.bank_account,
        ifsc_code=data.ifsc_code,
        upi_id=data.upi_id
    )
    db.add(seller)
    await db.commit()
    await db.refresh(seller)
    return seller


@router.put("/sellers/{seller_id}", response_model=SellerResponse)
async def update_seller(
    seller_id: UUID,
    data: SellerUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Seller).where(Seller.id == seller_id))
    seller = result.scalar_one_or_none()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    if seller.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(seller, key, value)
    seller.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(seller)
    return seller


@router.get("/sellers/{seller_id}/products")
async def list_seller_products(
    seller_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    seller = await db.get(Seller, seller_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    total_q = await db.execute(
        select(func.count()).select_from(Product).where(Product.user_id == seller_id)
    )
    total = total_q.scalar()

    result = await db.execute(
        select(Product).where(Product.user_id == seller_id)
        .order_by(Product.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    products = result.scalars().all()

    return {"items": products, "total": total, "page": page, "page_size": page_size}


@router.get("/sellers/{seller_id}/payouts", response_model=List[SellerPayoutResponse])
async def list_seller_payouts(
    seller_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    seller = await db.get(Seller, seller_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    if seller.user_id != current_user["user_id"] and current_user["role"] not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    total_q = await db.execute(
        select(func.count()).select_from(SellerPayout).where(SellerPayout.seller_id == seller_id)
    )
    total = total_q.scalar()

    result = await db.execute(
        select(SellerPayout).where(SellerPayout.seller_id == seller_id)
        .order_by(SellerPayout.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    payouts = result.scalars().all()

    return {"items": payouts, "total": total, "page": page, "page_size": page_size}


@router.post("/sellers/{seller_id}/payouts/request", response_model=SellerPayoutResponse)
async def request_payout(
    seller_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    seller = await db.get(Seller, seller_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    if seller.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    payout = SellerPayout(
        id=uuid4(),
        seller_id=seller_id,
        amount=seller.total_revenue,
        fee=seller.total_revenue * 0.02,
        tax=seller.total_revenue * 0.01,
        net_amount=seller.total_revenue * 0.97,
        status=PayoutStatus.PENDING,
        payout_method=PayoutMethod.BANK,
        period_start=datetime.now(timezone.utc).replace(day=1),
        period_end=datetime.now(timezone.utc)
    )
    db.add(payout)
    await db.commit()
    await db.refresh(payout)
    return payout
