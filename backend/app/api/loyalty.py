from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone, timedelta

from app.database import get_db
from app.models.user import User
from app.models.feature_extensions import (
    LoyaltyPoint, DailyReward, Referral, UserStreak, LoyaltyTier
)
from app.models.enterprise import LoyaltyTransaction, LoyaltyTransactionType
from app.schemas.enterprise import (
    LoyaltyTransactionResponse, DailyRewardResponse,
    DailyRewardClaimResponse, ReferralCreate, ReferralResponse
)
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/api/loyalty", tags=["Loyalty"])


@router.get("/points")
async def get_loyalty_points(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user = await db.get(User, current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "points": user.loyalty_points,
        "tier": user.tier,
        "total_orders": user.total_orders,
        "total_spent": user.total_spent
    }


@router.get("/transactions", response_model=List[LoyaltyTransactionResponse])
async def list_loyalty_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(LoyaltyTransaction).where(LoyaltyTransaction.user_id == current_user["user_id"])
        .order_by(LoyaltyTransaction.created_at.desc())
        .limit(50)
    )
    transactions = result.scalars().all()

    response = []
    for t in transactions:
        response.append(LoyaltyTransactionResponse(
            id=t.id,
            points=t.points,
            transaction_type=t.transaction_type.value if hasattr(t.transaction_type, 'value') else t.transaction_type,
            reference_type=t.reference_type,
            reference_id=t.reference_id,
            description=t.description,
            created_at=t.created_at
        ))
    return response


@router.get("/daily-reward", response_model=DailyRewardResponse)
async def get_daily_reward_status(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    today = datetime.now(timezone.utc).date()
    result = await db.execute(
        select(DailyReward).where(
            DailyReward.user_id == current_user["user_id"],
            func.date(DailyReward.created_at) == today
        )
    )
    reward = result.scalar_one_or_none()

    streak = await db.execute(
        select(UserStreak).where(UserStreak.user_id == current_user["user_id"])
    )
    streak_record = streak.scalar_one_or_none()

    return DailyRewardResponse(
        reward_date=today.isoformat(),
        points_earned=reward.reward_value if reward else 0,
        streak_day=streak_record.current_streak if streak_record else 0,
        claimed=reward is not None and reward.claimed
    )


@router.post("/daily-reward/claim", response_model=DailyRewardClaimResponse)
async def claim_daily_reward(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    today = datetime.now(timezone.utc).date()
    existing = await db.execute(
        select(DailyReward).where(
            DailyReward.user_id == current_user["user_id"],
            func.date(DailyReward.created_at) == today
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Daily reward already claimed today")

    streak = await db.execute(
        select(UserStreak).where(UserStreak.user_id == current_user["user_id"])
    )
    streak_record = streak.scalar_one_or_none()

    if streak_record:
        last_date = streak_record.last_activity_date
        if last_date and (datetime.now(timezone.utc).date() - last_date.date()).days == 1:
            streak_record.current_streak += 1
        else:
            streak_record.current_streak = 1
        streak_record.last_activity_date = datetime.now(timezone.utc)
        if streak_record.current_streak > streak_record.longest_streak:
            streak_record.longest_streak = streak_record.current_streak
    else:
        streak_record = UserStreak(
            id=uuid4(),
            user_id=current_user["user_id"],
            current_streak=1,
            longest_streak=1,
            last_activity_date=datetime.now(timezone.utc)
        )
        db.add(streak_record)

    day = streak_record.current_streak
    points = min(10 + (day - 1) * 2, 100)

    reward = DailyReward(
        id=uuid4(),
        user_id=current_user["user_id"],
        day_sequence=day,
        reward_type="points",
        reward_value=points,
        claimed=True,
        claimed_at=datetime.now(timezone.utc)
    )
    db.add(reward)

    user = await db.get(User, current_user["user_id"])
    user.loyalty_points = (user.loyalty_points or 0) + points

    loyalty_txn = LoyaltyTransaction(
        id=uuid4(),
        user_id=current_user["user_id"],
        points=points,
        transaction_type=LoyaltyTransactionType.EARNED,
        reference_type="daily_reward",
        description=f"Daily reward - Day {day}"
    )
    db.add(loyalty_txn)

    await db.commit()

    return DailyRewardClaimResponse(
        points_earned=points,
        streak_day=day,
        message=f"Daily reward claimed! +{points} points (Day {day})"
    )


@router.get("/referrals", response_model=List[ReferralResponse])
async def list_referrals(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Referral).where(Referral.referrer_id == current_user["user_id"])
        .order_by(Referral.created_at.desc())
    )
    referrals = result.scalars().all()
    return referrals


@router.post("/referrals", response_model=ReferralResponse, status_code=201)
async def create_referral(
    data: ReferralCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user = await db.get(User, current_user["user_id"])
    code = data.custom_code or f"REF-{user.full_name[:4].upper()}-{uuid4().hex[:4].upper()}"

    existing = await db.execute(select(Referral).where(Referral.referral_code == code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Referral code already exists")

    referral = Referral(
        id=uuid4(),
        referrer_id=current_user["user_id"],
        referral_code=code,
        status="pending",
        reward_points=50
    )
    db.add(referral)
    await db.commit()
    await db.refresh(referral)
    return referral


@router.get("/leaderboard")
async def get_leaderboard(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    total_q = await db.execute(
        select(func.count()).select_from(User).where(User.is_active == True)
    )
    total = total_q.scalar()

    result = await db.execute(
        select(User).where(User.is_active == True)
        .order_by(User.loyalty_points.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    users = result.scalars().all()

    items = [
        {
            "user_id": u.id,
            "full_name": u.full_name,
            "avatar_url": u.avatar_url,
            "points": u.loyalty_points,
            "tier": u.tier
        }
        for u in users
    ]

    return {"items": items, "total": total, "page": page, "page_size": page_size}
