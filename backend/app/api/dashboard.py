import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from app.database import get_db
from app.auth.jwt import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.interaction import Wishlist, BrowsingHistory
from app.models.feature_extensions import (
    UserPersona, LoyaltyPoint, UserStreak, XPLevel, Achievement,
    ShoppingDNA, ReorderPrediction, PricePrediction, UserSpendingAnalysis,
    CustomerLifetimeValue, SmartCouponRecommendation, AchievementBadge,
    DailyReward, Referral, NotificationSchedule,
)
from app.models.additional import Notification
from pydantic import BaseModel

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


class DashboardStats(BaseModel):
    total_orders: int = 0
    wishlist_count: int = 0
    cart_count: int = 0
    reward_points: int = 0
    total_savings: float = 0.0
    ai_match_accuracy: float = 0.0
    pending_orders: int = 0
    delivered_orders: int = 0
    cancelled_orders: int = 0


class DashboardPersona(BaseModel):
    persona_type: str = "window_shopper"
    persona_label: str = "Window Shopper"
    confidence: float = 0.0
    features: dict = {}


class DashboardLoyalty(BaseModel):
    tier: str = "Bronze"
    points: int = 0
    next_tier: str = "Silver"
    points_to_next: int = 500
    progress: float = 0.0
    streak: int = 0
    longest_streak: int = 0


class DashboardSummaryResponse(BaseModel):
    user_name: str = "User"
    user_email: str = ""
    persona: Optional[DashboardPersona] = None
    stats: DashboardStats = DashboardStats()
    loyalty: Optional[DashboardLoyalty] = None
    xp_level: int = 1
    xp_current: int = 0
    xp_next: int = 1000
    unread_notifications: int = 0


@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        return DashboardSummaryResponse()

    order_count = await db.scalar(select(func.count(Order.id)).where(Order.user_id == user_id))
    pending_count = await db.scalar(select(func.count(Order.id)).where(Order.user_id == user_id, Order.status == "pending"))
    delivered_count = await db.scalar(select(func.count(Order.id)).where(Order.user_id == user_id, Order.status == "delivered"))
    cancelled_count = await db.scalar(select(func.count(Order.id)).where(Order.user_id == user_id, Order.status == "cancelled"))
    wishlist_count = await db.scalar(select(func.count(Wishlist.id)).where(Wishlist.user_id == user_id))

    persona_result = await db.execute(select(UserPersona).where(UserPersona.user_id == user_id))
    persona = persona_result.scalar_one_or_none()

    loyalty_result = await db.execute(
        select(LoyaltyPoint).where(LoyaltyPoint.user_id == user_id).order_by(desc(LoyaltyPoint.created_at)).limit(1)
    )
    lp = loyalty_result.scalar_one_or_none()
    streak_result = await db.execute(select(UserStreak).where(UserStreak.user_id == user_id))
    streak = streak_result.scalar_one_or_none()

    xp_result = await db.execute(select(XPLevel).where(XPLevel.user_id == user_id))
    xp = xp_result.scalar_one_or_none()

    notif_count = await db.scalar(
        select(func.count(Notification.id)).where(Notification.user_id == user_id, Notification.is_read == False)
    )

    total_savings = 0.0
    if user.total_saved:
        total_savings = float(user.total_saved)

    tier = "Bronze"
    points = 0
    next_tier = "Silver"
    points_to_next = 500
    progress = 0.0
    if lp:
        points = lp.points or 0
        tier = lp.tier or "Bronze"
        tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"]
        current_idx = tiers.index(tier) if tier in tiers else 0
        if current_idx < len(tiers) - 1:
            next_tier = tiers[current_idx + 1]
            points_to_next = (current_idx + 1) * 2500 - points
            progress = min(points / ((current_idx + 1) * 2500), 1.0)
        else:
            next_tier = tier
            points_to_next = 0
            progress = 1.0

    return DashboardSummaryResponse(
        user_name=user.full_name or user.email.split("@")[0],
        user_email=user.email,
        persona=DashboardPersona(
            persona_type=persona.persona_type.value if persona else "window_shopper",
            persona_label=persona.persona_label if persona else "Window Shopper",
            confidence=persona.confidence if persona else 0.0,
            features=persona.features if persona else {},
        ) if persona else None,
        stats=DashboardStats(
            total_orders=order_count or 0,
            wishlist_count=wishlist_count or 0,
            cart_count=0,
            reward_points=points,
            total_savings=total_savings,
            ai_match_accuracy=persona.confidence if persona else 0.0,
            pending_orders=pending_count or 0,
            delivered_orders=delivered_count or 0,
            cancelled_orders=cancelled_count or 0,
        ),
        loyalty=DashboardLoyalty(
            tier=tier,
            points=points,
            next_tier=next_tier,
            points_to_next=max(0, points_to_next),
            progress=progress,
            streak=streak.current_streak if streak else 0,
            longest_streak=streak.longest_streak if streak else 0,
        ),
        xp_level=xp.level if xp else 1,
        xp_current=xp.current_xp if xp else 0,
        xp_next=xp.next_level_xp if xp else 1000,
        unread_notifications=notif_count or 0,
    )


@router.get("/recommendations")
async def get_dashboard_recommendations(
    limit: int = Query(8, le=20),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    from app.api.recommendations import get_personalized_recommendations, get_trending_products
    recs = await get_personalized_recommendations(limit, db, current_user)
    trending = await get_trending_products(limit, db, current_user)
    return {"recommendations": recs, "trending": trending}


@router.get("/orders")
async def get_dashboard_orders(
    limit: int = Query(5, le=20),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    result = await db.execute(
        select(Order).where(Order.user_id == user_id).order_by(desc(Order.created_at)).limit(limit)
    )
    orders = result.scalars().all()
    return [
        {
            "id": o.id,
            "status": o.status,
            "total": float(o.total) if o.total else 0.0,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "item_count": o.item_count or 0,
        }
        for o in orders
    ]


@router.get("/notifications")
async def get_dashboard_notifications(
    limit: int = Query(10, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    result = await db.execute(
        select(Notification).where(Notification.user_id == user_id)
        .order_by(desc(Notification.created_at)).limit(limit)
    )
    notifs = result.scalars().all()
    unread = await db.scalar(
        select(func.count(Notification.id)).where(Notification.user_id == user_id, Notification.is_read == False)
    )
    return {
        "notifications": [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "type": n.notification_type,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "link": n.link or "#",
            }
            for n in notifs
        ],
        "unread_count": unread or 0,
    }


@router.get("/loyalty")
async def get_dashboard_loyalty(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    lp_result = await db.execute(
        select(LoyaltyPoint).where(LoyaltyPoint.user_id == user_id).order_by(desc(LoyaltyPoint.created_at)).limit(1)
    )
    lp = lp_result.scalar_one_or_none()
    streak_result = await db.execute(select(UserStreak).where(UserStreak.user_id == user_id))
    streak = streak_result.scalar_one_or_none()
    badges_result = await db.execute(
        select(AchievementBadge).where(AchievementBadge.user_id == user_id)
    )
    badges = badges_result.scalars().all()
    daily_result = await db.execute(
        select(DailyReward).where(DailyReward.user_id == user_id).order_by(DailyReward.day)
    )
    daily = daily_result.scalars().all()
    referral_result = await db.execute(
        select(func.count(Referral.id)).where(Referral.referrer_id == user_id, Referral.reward_claimed == True)
    )
    referral_count = referral_result.scalar() or 0

    tier = lp.tier if lp else "Bronze"
    points = lp.points if lp else 0
    tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"]
    current_idx = tiers.index(tier) if tier in tiers else 0

    return {
        "tier": tier,
        "points": points,
        "next_tier": tiers[current_idx + 1] if current_idx < len(tiers) - 1 else tier,
        "progress": min(points / ((current_idx + 1) * 2500), 1.0) if current_idx < len(tiers) - 1 else 1.0,
        "streak": streak.current_streak if streak else 0,
        "longest_streak": streak.longest_streak if streak else 0,
        "badges": [{"id": b.id, "name": b.name, "icon": b.icon_url or "", "earned_at": b.earned_at.isoformat() if b.earned_at else None} for b in badges],
        "daily_rewards": [{"day": d.day, "reward": d.reward_name, "claimed": d.claimed} for d in daily],
        "referral_count": referral_count,
    }


@router.get("/analytics")
async def get_dashboard_analytics(
    days: int = Query(30, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    cutoff = datetime.utcnow() - timedelta(days=days)

    spending_result = await db.execute(
        select(UserSpendingAnalysis).where(UserSpendingAnalysis.user_id == user_id)
        .order_by(desc(UserSpendingAnalysis.period_start)).limit(12)
    )
    spending = spending_result.scalars().all()

    clv_result = await db.execute(
        select(CustomerLifetimeValue).where(CustomerLifetimeValue.user_id == user_id)
    )
    clv = clv_result.scalar_one_or_none()

    monthly_spending = []
    for s in spending:
        monthly_spending.append({
            "period": s.period_start.isoformat() if s.period_start else "",
            "amount": float(s.total_spent) if s.total_spent else 0.0,
            "orders": s.order_count or 0,
        })

    orders_result = await db.execute(
        select(Order).where(Order.user_id == user_id, Order.created_at >= cutoff)
        .order_by(Order.created_at)
    )
    recent_orders = orders_result.scalars().all()
    order_history = []
    for o in recent_orders:
        order_history.append({
            "date": o.created_at.isoformat() if o.created_at else "",
            "amount": float(o.total) if o.total else 0.0,
            "status": o.status or "unknown",
        })

    category_spending = {}
    for o in recent_orders:
        items_result = await db.execute(
            select(OrderItem).where(OrderItem.order_id == o.id)
        )
        items = items_result.scalars().all()
        for item in items:
            cat = item.category_name or "Other"
            category_spending[cat] = category_spending.get(cat, 0) + float(item.price or 0)

    total_spent = sum(o.total or 0 for o in recent_orders)
    total_saved = float(user.total_saved) if user else 0.0

    return {
        "monthly_spending": monthly_spending,
        "order_history": order_history,
        "category_spending": [{"category": k, "amount": v} for k, v in category_spending.items()],
        "total_savings": total_saved,
        "total_spent_30d": float(total_spent) if total_spent else 0.0,
        "clv": float(clv.predicted_clv) if clv else 0.0,
        "average_order_value": float(total_spent / len(recent_orders)) if recent_orders else 0.0,
        "return_rate": 0.0,
    }
