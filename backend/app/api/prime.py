from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone, timedelta

from app.database import get_db
from app.models.enterprise import (
    PrimeSubscription, SubscriptionPlan, SubscriptionStatus
)
from app.models.user import User
from app.schemas.enterprise import (
    PrimeCreateCheckout, PrimeSubscriptionResponse,
    PrimeCheckoutResponse
)
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/api/prime", tags=["Prime Subscription"])


@router.get("/subscription", response_model=PrimeSubscriptionResponse)
async def get_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(PrimeSubscription).where(PrimeSubscription.user_id == current_user["user_id"])
    )
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found")

    days_remaining = 0
    if sub.end_date:
        days_remaining = max(0, (sub.end_date - datetime.now(timezone.utc)).days)

    return PrimeSubscriptionResponse(
        id=sub.id,
        plan=sub.plan.value if hasattr(sub.plan, 'value') else sub.plan,
        status=sub.status.value if hasattr(sub.status, 'value') else sub.status,
        start_date=sub.start_date,
        end_date=sub.end_date,
        auto_renew=sub.auto_renew,
        days_remaining=days_remaining
    )


@router.post("/create-checkout", response_model=PrimeCheckoutResponse)
async def create_prime_checkout(
    data: PrimeCreateCheckout,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing = await db.execute(
        select(PrimeSubscription).where(
            PrimeSubscription.user_id == current_user["user_id"],
            PrimeSubscription.status == SubscriptionStatus.ACTIVE
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You already have an active subscription")

    now = datetime.now(timezone.utc)
    plan_durations = {
        "monthly": timedelta(days=30),
        "yearly": timedelta(days=365),
        "lifetime": timedelta(days=36500)
    }

    duration = plan_durations.get(data.plan, timedelta(days=30))

    sub = PrimeSubscription(
        id=uuid4(),
        user_id=current_user["user_id"],
        plan=SubscriptionPlan(data.plan),
        status=SubscriptionStatus.ACTIVE,
        start_date=now,
        end_date=now + duration,
        auto_renew=data.plan != "lifetime"
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)

    return PrimeCheckoutResponse(
        url=f"/api/payments/stripe/prime/{sub.id}",
        subscription_id=sub.id
    )


@router.post("/webhook")
async def handle_prime_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    body = await request.json()
    event_type = body.get("type")
    subscription_id = body.get("subscription_id")

    if event_type == "subscription_renewed" and subscription_id:
        result = await db.execute(
            select(PrimeSubscription).where(
                PrimeSubscription.gateway_subscription_id == subscription_id
            )
        )
        sub = result.scalar_one_or_none()
        if sub:
            sub.end_date = datetime.now(timezone.utc) + timedelta(days=30)
            await db.commit()

    return {"message": "Webhook received"}


@router.post("/cancel")
async def cancel_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(PrimeSubscription).where(
            PrimeSubscription.user_id == current_user["user_id"],
            PrimeSubscription.status == SubscriptionStatus.ACTIVE
        )
    )
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found")

    sub.auto_renew = False
    await db.commit()
    return {"message": "Auto-renewal cancelled. Subscription will end on " + str(sub.end_date.date())}


@router.get("/benefits")
async def list_prime_benefits():
    return {
        "benefits": [
            {"name": "Free Shipping", "description": "Free shipping on all orders"},
            {"name": "Early Access", "description": "Early access to flash sales and new products"},
            {"name": "Exclusive Deals", "description": "Member-only discounts and offers"},
            {"name": "Priority Support", "description": "24/7 priority customer support"},
            {"name": "Extended Returns", "description": "60-day return window on all products"}
        ]
    }
