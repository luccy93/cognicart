import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.auth.jwt import get_current_user, require_admin
from app.ai.chat_service import chat_service
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.additional import Coupon
from app.models.interaction import Wishlist
from app.models.feature_extensions import (
    UserPersona, PersonaType, RecommendationExplanation, UserPersonaHistory,
    LoyaltyPoint, DailyReward, UserStreak, Referral,
    AuditLog, FeatureFlag, ABTest, NPSFeedback,
    PriceAlert, StockAlert, ProductComparison, ChatHistory,
    AchievementBadge, BadgeType, UserFollower, CommunityRecommendation,
    SmartReturn, SupportTicket, Feedback, ThemePreference, ThemeType,
    DashboardLayout, OnboardingProgress, ProductShare, WishlistShare,
    SmartCouponRecommendation, UserSpendingAnalysis, ProductTrendAnalysis,
    CustomerLifetimeValue, NotificationSchedule, NotificationType, LoyaltyTier,
)
from app.schemas.feature_extensions import *

router = APIRouter(prefix="/api/features", tags=["features"])


# ──────────────────────────────────────────────
# 1. USER PERSONA
# ──────────────────────────────────────────────

@router.get("/persona", response_model=PersonaResponse)
async def get_user_persona(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(UserPersona).where(UserPersona.user_id == current_user["user_id"])
    )
    persona = result.scalar_one_or_none()
    if not persona:
        from app.utils.helpers import calculate_tier
        tier = calculate_tier(0)
        # Classify based on user data
        user_result = await db.execute(select(User).where(User.id == current_user["user_id"]))
        user = user_result.scalar_one_or_none()
        persona_type = PersonaType.window_shopper
        label = "Window Shopper"
        if user and user.total_orders > 0:
            if user.total_spent > 50000:
                persona_type = PersonaType.premium_shopper
                label = "Premium Shopper"
            elif user.total_orders > 10:
                persona_type = PersonaType.frequent_buyer
                label = "Frequent Buyer"
            else:
                persona_type = PersonaType.budget_shopper
                label = "Budget Shopper"
        if user and user.preferred_categories:
            cats = user.preferred_categories.lower()
            if "tech" in cats or "electronics" in cats or "gaming" in cats:
                persona_type = PersonaType.tech_enthusiast
                label = "Tech Enthusiast"
            elif "fashion" in cats or "clothing" in cats:
                persona_type = PersonaType.fashion_lover
                label = "Fashion Lover"
        persona = UserPersona(
            id=str(uuid.uuid4()),
            user_id=current_user["user_id"],
            persona_type=persona_type,
            persona_label=label,
            confidence=0.85,
            features={"total_orders": user.total_orders if user else 0, "total_spent": float(user.total_spent) if user else 0.0}
        )
        db.add(persona)
        await db.commit()
        await db.refresh(persona)
    return persona


@router.get("/persona/history", response_model=List[PersonaHistoryResponse])
async def get_persona_history(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(UserPersonaHistory).where(UserPersonaHistory.user_id == current_user["user_id"])
        .order_by(desc(UserPersonaHistory.changed_at)).limit(20)
    )
    return result.scalars().all()


# ──────────────────────────────────────────────
# 2. RECOMMENDATION EXPLANATIONS
# ──────────────────────────────────────────────

@router.get("/recommendation-explanations", response_model=List[RecommendationExplanationResponse])
async def get_recommendation_explanations(
    product_id: Optional[str] = Query(None),
    limit: int = Query(10, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = select(RecommendationExplanation).where(
        RecommendationExplanation.user_id == current_user["user_id"]
    )
    if product_id:
        query = query.where(RecommendationExplanation.product_id == product_id)
    query = query.order_by(desc(RecommendationExplanation.confidence)).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/recommendation-explanations/detail", response_model=RecommendationExplanationDetail)
async def get_explanation_detail(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(RecommendationExplanation).where(
            RecommendationExplanation.user_id == current_user["user_id"]
        ).order_by(desc(RecommendationExplanation.created_at)).limit(20)
    )
    explanations = result.scalars().all()
    if not explanations:
        return RecommendationExplanationDetail(reasons=[], confidence_overall=0.0)
    avg_conf = sum(e.confidence for e in explanations) / len(explanations)
    # Aggregate engine contributions
    engine_data = {}
    for e in explanations:
        for k, v in (e.engine_contribution or {}).items():
            engine_data[k] = engine_data.get(k, 0) + v
    total = sum(engine_data.values()) or 1
    engine_breakdown = {k: round(v / total * 100, 1) for k, v in engine_data.items()}
    # Top features
    feature_counts = {}
    for e in explanations:
        for k, v in (e.feature_importance or {}).items():
            feature_counts[k] = feature_counts.get(k, 0) + v
    top_features = sorted(feature_counts.items(), key=lambda x: -x[1])[:5]
    return RecommendationExplanationDetail(
        reasons=[RecommendationExplanationResponse.model_validate(e) for e in explanations],
        confidence_overall=round(avg_conf * 100, 1),
        top_features=[{"feature": k, "importance": round(v, 3)} for k, v in top_features],
        engine_breakdown=engine_breakdown,
    )


# ──────────────────────────────────────────────
# 3. LOYALTY PROGRAM
# ──────────────────────────────────────────────

@router.get("/loyalty/summary", response_model=LoyaltySummaryResponse)
async def get_loyalty_summary(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user_result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")
    points_result = await db.execute(
        select(LoyaltyPoint).where(LoyaltyPoint.user_id == current_user["user_id"])
        .order_by(desc(LoyaltyPoint.created_at)).limit(10)
    )
    recent = points_result.scalars().all()
    tier_order = ["bronze", "silver", "gold", "platinum", "diamond"]
    tier_thresholds = {"bronze": 0, "silver": 1000, "gold": 2500, "platinum": 5000, "diamond": 10000}
    current_tier = user.tier or "bronze"
    current_idx = tier_order.index(current_tier) if current_tier in tier_order else 0
    next_tier = tier_order[current_idx + 1] if current_idx + 1 < len(tier_order) else None
    points_to_next = tier_thresholds.get(next_tier, 0) - user.loyalty_points if next_tier else 0
    progress = 0.0
    if next_tier:
        current_threshold = tier_thresholds.get(current_tier, 0)
        next_threshold = tier_thresholds.get(next_tier, 10000)
        progress = (user.loyalty_points - current_threshold) / (next_threshold - current_threshold)
    return LoyaltySummaryResponse(
        total_points=user.loyalty_points,
        tier=current_tier,
        points_to_next_tier=max(0, points_to_next),
        tier_progress=min(1.0, max(0.0, progress)),
        recent_points=[LoyaltyPointResponse.model_validate(p) for p in recent],
    )


@router.get("/loyalty/points", response_model=List[LoyaltyPointResponse])
async def get_loyalty_points(
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(LoyaltyPoint).where(LoyaltyPoint.user_id == current_user["user_id"])
        .order_by(desc(LoyaltyPoint.created_at)).limit(limit)
    )
    return result.scalars().all()


# ──────────────────────────────────────────────
# 4. DAILY REWARDS
# ──────────────────────────────────────────────

@router.get("/daily-rewards", response_model=List[DailyRewardResponse])
async def get_daily_rewards(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(DailyReward).where(DailyReward.user_id == current_user["user_id"])
        .order_by(DailyReward.day_sequence).limit(30)
    )
    rewards = result.scalars().all()
    if not rewards:
        # Create default 7-day rewards
        reward_configs = [
            (1, "points", 10), (2, "points", 15), (3, "points", 20),
            (4, "points", 25), (5, "points", 30), (6, "points", 40),
            (7, "bonus", 100),
        ]
        for day, rtype, value in reward_configs:
            db.add(DailyReward(
                id=str(uuid.uuid4()),
                user_id=current_user["user_id"],
                day_sequence=day,
                reward_type=rtype,
                reward_value=value,
            ))
        await db.commit()
        result = await db.execute(
            select(DailyReward).where(DailyReward.user_id == current_user["user_id"])
            .order_by(DailyReward.day_sequence).limit(30)
        )
        rewards = result.scalars().all()
    return [DailyRewardResponse.model_validate(r) for r in rewards]


@router.post("/daily-rewards/claim", response_model=DailyRewardClaimResponse)
async def claim_daily_reward(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Find next unclaimed reward
    result = await db.execute(
        select(DailyReward).where(
            DailyReward.user_id == current_user["user_id"],
            DailyReward.claimed == False,
        ).order_by(DailyReward.day_sequence).limit(1)
    )
    reward = result.scalar_one_or_none()
    if not reward:
        raise HTTPException(400, "No rewards available to claim")
    reward.claimed = True
    reward.claimed_at = datetime.utcnow()
    # Award points
    user_result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = user_result.scalar_one()
    user.loyalty_points += reward.reward_value
    db.add(LoyaltyPoint(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        points=reward.reward_value,
        source="daily_reward",
        description=f"Day {reward.day_sequence} reward",
    ))
    # Update streak
    streak_result = await db.execute(
        select(UserStreak).where(UserStreak.user_id == current_user["user_id"])
    )
    streak = streak_result.scalar_one_or_none()
    if not streak:
        streak = UserStreak(
            id=str(uuid.uuid4()),
            user_id=current_user["user_id"],
            current_streak=1,
            longest_streak=1,
            last_activity_date=datetime.utcnow(),
        )
        db.add(streak)
    else:
        today = datetime.utcnow().date()
        last = streak.last_activity_date.date() if streak.last_activity_date else today - timedelta(days=2)
        if (today - last).days == 1:
            streak.current_streak += 1
            streak.longest_streak = max(streak.longest_streak, streak.current_streak)
        elif (today - last).days > 1:
            streak.current_streak = 1
        streak.last_activity_date = datetime.utcnow()
    await db.commit()
    return DailyRewardClaimResponse(
        claimed=True,
        reward_type=reward.reward_type,
        reward_value=reward.reward_value,
        current_streak=streak.current_streak if streak else 1,
        message=f"Claimed {reward.reward_value} {reward.reward_type}!",
    )


# ──────────────────────────────────────────────
# 5. STREAKS
# ──────────────────────────────────────────────

@router.get("/streaks", response_model=StreakResponse)
async def get_streaks(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(UserStreak).where(UserStreak.user_id == current_user["user_id"])
    )
    streak = result.scalar_one_or_none()
    if not streak:
        streak = UserStreak(
            id=str(uuid.uuid4()),
            user_id=current_user["user_id"],
            current_streak=0,
            longest_streak=0,
        )
        db.add(streak)
        await db.commit()
        await db.refresh(streak)
    return streak


# ──────────────────────────────────────────────
# 6. REFERRALS
# ──────────────────────────────────────────────

@router.get("/referrals", response_model=ReferralStatsResponse)
async def get_referral_stats(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(Referral).where(Referral.referrer_id == current_user["user_id"])
    )
    refs = result.scalars().all()
    total = len(refs)
    successful = sum(1 for r in refs if r.status == "completed")
    pending = sum(1 for r in refs if r.status == "pending")
    total_rewards = sum(r.reward_points for r in refs if r.reward_claimed)
    user_result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = user_result.scalar_one()
    code = user.id[:8].upper() if user else "COGNI"
    return ReferralStatsResponse(
        total_referrals=total,
        successful_referrals=successful,
        pending_referrals=pending,
        total_rewards_earned=total_rewards,
        referral_link=f"https://cognicart.ai/ref/{code}",
    )


@router.post("/referrals", response_model=ReferralResponse)
async def create_referral(
    data: ReferralCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    code = current_user["user_id"][:6].upper() + datetime.utcnow().strftime("%H%M")
    ref = Referral(
        id=str(uuid.uuid4()),
        referrer_id=current_user["user_id"],
        referred_email=data.referred_email,
        referral_code=code,
    )
    db.add(ref)
    await db.commit()
    await db.refresh(ref)
    return ref


# ──────────────────────────────────────────────
# 7. AUDIT LOGS (admin)
# ──────────────────────────────────────────────

@router.get("/audit-logs", response_model=AuditLogListResponse)
async def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    action: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    query = select(AuditLog)
    if action:
        query = query.where(AuditLog.action == action)
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    query = query.order_by(desc(AuditLog.created_at)).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = result.scalars().all()
    return AuditLogListResponse(
        items=[AuditLogResponse.model_validate(i) for i in items],
        total=total, page=page, page_size=page_size,
        total_pages=-(-total // page_size) if total else 0,
    )


# ──────────────────────────────────────────────
# 8. FEATURE FLAGS (admin)
# ──────────────────────────────────────────────

@router.get("/feature-flags", response_model=List[FeatureFlagResponse])
async def get_feature_flags(db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    result = await db.execute(select(FeatureFlag).order_by(FeatureFlag.name))
    return result.scalars().all()


@router.post("/feature-flags", response_model=FeatureFlagResponse)
async def create_feature_flag(
    data: FeatureFlagCreate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    existing = await db.execute(select(FeatureFlag).where(FeatureFlag.name == data.name))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Feature flag already exists")
    flag = FeatureFlag(id=str(uuid.uuid4()), **data.model_dump())
    db.add(flag)
    await db.commit()
    await db.refresh(flag)
    return flag


@router.put("/feature-flags/{flag_id}", response_model=FeatureFlagResponse)
async def update_feature_flag(
    flag_id: str,
    data: FeatureFlagUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    result = await db.execute(select(FeatureFlag).where(FeatureFlag.id == flag_id))
    flag = result.scalar_one_or_none()
    if not flag:
        raise HTTPException(404, "Feature flag not found")
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(flag, k, v)
    await db.commit()
    await db.refresh(flag)
    return flag


# ──────────────────────────────────────────────
# 9. A/B TESTING (admin)
# ──────────────────────────────────────────────

@router.get("/ab-tests", response_model=List[ABTestResponse])
async def get_ab_tests(db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    result = await db.execute(select(ABTest).order_by(desc(ABTest.started_at)))
    return result.scalars().all()


@router.post("/ab-tests", response_model=ABTestResponse)
async def create_ab_test(data: ABTestCreate, db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    test = ABTest(id=str(uuid.uuid4()), **data.model_dump())
    db.add(test)
    await db.commit()
    await db.refresh(test)
    return test


@router.post("/ab-tests/conversion")
async def record_ab_conversion(
    data: ABTestRecordConversion,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    result = await db.execute(select(ABTest).where(ABTest.id == data.test_id))
    test = result.scalar_one_or_none()
    if not test:
        raise HTTPException(404, "AB test not found")
    if data.variant == "a":
        test.variant_a_conversions += 1
    else:
        test.variant_b_conversions += 1
    await db.commit()
    return {"status": "recorded"}


# ──────────────────────────────────────────────
# 10. NPS FEEDBACK
# ──────────────────────────────────────────────

@router.post("/nps", response_model=NPSFeedbackResponse)
async def submit_nps(
    data: NPSFeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    fb = NPSFeedback(id=str(uuid.uuid4()), user_id=current_user["user_id"], **data.model_dump())
    db.add(fb)
    await db.commit()
    await db.refresh(fb)
    return fb


@router.get("/nps/analytics", response_model=NPSAnalyticsResponse)
async def get_nps_analytics(db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    result = await db.execute(select(NPSFeedback))
    all_fb = result.scalars().all()
    total = len(all_fb) or 1
    avg = sum(f.score for f in all_fb) / total if all_fb else 0
    promoters = sum(1 for f in all_fb if f.score >= 9)
    passives = sum(1 for f in all_fb if 7 <= f.score <= 8)
    detractors = sum(1 for f in all_fb if f.score <= 6)
    nps = ((promoters - detractors) / total) * 100 if total else 0
    return NPSAnalyticsResponse(
        average_score=round(avg, 1),
        total_responses=len(all_fb),
        promoters=promoters,
        passives=passives,
        detractors=detractors,
        nps_score=round(nps, 1),
    )


# ──────────────────────────────────────────────
# 11. PRICE ALERTS
# ──────────────────────────────────────────────

@router.get("/price-alerts", response_model=List[PriceAlertResponse])
async def get_price_alerts(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(PriceAlert).where(PriceAlert.user_id == current_user["user_id"])
        .order_by(desc(PriceAlert.created_at))
    )
    return result.scalars().all()


@router.post("/price-alerts", response_model=PriceAlertResponse)
async def create_price_alert(
    data: PriceAlertCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    product_result = await db.execute(select(Product).where(Product.id == data.product_id))
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(404, "Product not found")
    alert = PriceAlert(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        product_id=data.product_id,
        target_price=data.target_price,
        current_price=product.price,
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert


@router.delete("/price-alerts/{alert_id}")
async def delete_price_alert(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(PriceAlert).where(
            PriceAlert.id == alert_id,
            PriceAlert.user_id == current_user["user_id"],
        )
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(404, "Price alert not found")
    await db.delete(alert)
    await db.commit()
    return {"status": "deleted"}


# ──────────────────────────────────────────────
# 12. STOCK ALERTS
# ──────────────────────────────────────────────

@router.get("/stock-alerts", response_model=List[StockAlertResponse])
async def get_stock_alerts(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(StockAlert).where(StockAlert.user_id == current_user["user_id"])
        .order_by(desc(StockAlert.created_at))
    )
    return result.scalars().all()


@router.post("/stock-alerts", response_model=StockAlertResponse)
async def create_stock_alert(
    data: StockAlertCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    alert = StockAlert(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        product_id=data.product_id,
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert


# ──────────────────────────────────────────────
# 13. PRODUCT COMPARISON
# ──────────────────────────────────────────────

@router.get("/comparisons", response_model=ProductComparisonResponse)
async def get_comparison(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(ProductComparison).where(ProductComparison.user_id == current_user["user_id"])
        .order_by(desc(ProductComparison.updated_at)).limit(1)
    )
    comp = result.scalar_one_or_none()
    if not comp:
        return ProductComparisonResponse(id="", product_ids=[], updated_at=datetime.utcnow())
    return comp


@router.post("/comparisons", response_model=ProductComparisonResponse)
async def save_comparison(
    data: ProductComparisonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(ProductComparison).where(ProductComparison.user_id == current_user["user_id"])
    )
    comp = result.scalar_one_or_none()
    if comp:
        comp.product_ids = data.product_ids
        comp.updated_at = datetime.utcnow()
    else:
        comp = ProductComparison(
            id=str(uuid.uuid4()),
            user_id=current_user["user_id"],
            product_ids=data.product_ids,
        )
        db.add(comp)
    await db.commit()
    await db.refresh(comp)
    return comp


@router.get("/compare/{product_ids}")
async def compare_products(
    product_ids: str,
    db: AsyncSession = Depends(get_db),
):
    ids = product_ids.split(",")[:4]
    result = await db.execute(
        select(Product).where(Product.id.in_(ids)).options(selectinload(Product.category))
    )
    products = result.scalars().all()
    comparison = []
    for p in products:
        comparison.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "original_price": p.original_price,
            "currency": p.currency,
            "brand": p.brand,
            "average_rating": p.average_rating,
            "total_ratings": p.total_ratings,
            "total_reviews": p.total_reviews,
            "stock": p.stock,
            "is_active": p.is_active,
            "description": p.short_description,
            "thumbnail_url": p.thumbnail_url,
            "category": p.category.name if p.category else None,
            "tags": p.tags,
        })
    return {"products": comparison, "count": len(comparison)}


# ──────────────────────────────────────────────
# 14. CHAT HISTORY
# ──────────────────────────────────────────────

@router.get("/chat/sessions", response_model=List[str])
async def get_chat_sessions(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(ChatHistory.session_id).where(ChatHistory.user_id == current_user["user_id"])
        .distinct().order_by(desc(ChatHistory.created_at)).limit(20)
    )
    return [row[0] for row in result.all()]


@router.get("/chat/{session_id}", response_model=ChatSessionResponse)
async def get_chat_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(ChatHistory).where(
            ChatHistory.user_id == current_user["user_id"],
            ChatHistory.session_id == session_id,
        ).order_by(ChatHistory.created_at)
    )
    messages = result.scalars().all()
    return ChatSessionResponse(session_id=session_id, messages=[ChatHistoryResponse.model_validate(m) for m in messages])


@router.post("/chat", response_model=ChatHistoryResponse)
async def save_chat_message(
    data: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    msg = ChatHistory(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        session_id=data.session_id,
        role="user",
        content=data.content,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


@router.post("/chat/send")
async def send_chat_message(
    data: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = str(current_user["user_id"])
    session_id = await chat_service.get_or_create_session(user_id, data.session_id or None, db)

    # Save user message
    await chat_service.save_message(user_id, session_id, "user", data.content, db=db)

    # Generate AI response
    response = await chat_service.generate_response(user_id, data.content, session_id, db)

    # Save AI response
    response_content = response.get("content", "")
    await chat_service.save_message(user_id, session_id, "assistant", response_content, db=db)

    return {
        "session_id": session_id,
        "response": response,
    }


# ──────────────────────────────────────────────
# 15. ACHIEVEMENTS
# ──────────────────────────────────────────────

@router.get("/achievements", response_model=List[AchievementBadgeResponse])
async def get_achievements(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(AchievementBadge).where(AchievementBadge.user_id == current_user["user_id"])
    )
    badges = result.scalars().all()
    if not badges:
        default_badges = [
            (BadgeType.first_purchase, "First Purchase", "🎉", "Complete your first purchase"),
            (BadgeType.loyal_customer, "Loyal Customer", "💎", "Reach Gold tier"),
            (BadgeType.top_reviewer, "Top Reviewer", "⭐", "Write 5 reviews"),
            (BadgeType.trend_explorer, "Trend Explorer", "🔍", "View 50 products"),
            (BadgeType.early_adopter, "Early Adopter", "🚀", "Joined in first month"),
            (BadgeType.shopaholic, "Shopaholic", "🛍️", "Place 10 orders"),
            (BadgeType.streak_master, "Streak Master", "🔥", "7-day login streak"),
            (BadgeType.deal_hunter, "Deal Hunter", "💎", "Buy 3 discounted items"),
            (BadgeType.social_butterfly, "Social Butterfly", "🦋", "Refer 3 friends"),
            (BadgeType.influencer, "Influencer", "👑", "Get 100 followers"),
        ]
        for btype, label, icon, desc in default_badges:
            db.add(AchievementBadge(
                id=str(uuid.uuid4()),
                user_id=current_user["user_id"],
                badge_type=btype,
                badge_label=label,
                badge_icon=icon,
                description=desc,
                earned=False,
                progress=0.0,
            ))
        await db.commit()
        result = await db.execute(
            select(AchievementBadge).where(AchievementBadge.user_id == current_user["user_id"])
        )
        badges = result.scalars().all()
    return [AchievementBadgeResponse.model_validate(b) for b in badges]


# ──────────────────────────────────────────────
# 16. FOLLOW SYSTEM
# ──────────────────────────────────────────────

@router.post("/follow/{user_id}")
async def follow_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if user_id == current_user["user_id"]:
        raise HTTPException(400, "Cannot follow yourself")
    existing = await db.execute(
        select(UserFollower).where(
            UserFollower.follower_id == current_user["user_id"],
            UserFollower.following_id == user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Already following this user")
    follow = UserFollower(
        id=str(uuid.uuid4()),
        follower_id=current_user["user_id"],
        following_id=user_id,
    )
    db.add(follow)
    await db.commit()
    return {"status": "following"}


@router.delete("/follow/{user_id}")
async def unfollow_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(UserFollower).where(
            UserFollower.follower_id == current_user["user_id"],
            UserFollower.following_id == user_id,
        )
    )
    follow = result.scalar_one_or_none()
    if not follow:
        raise HTTPException(404, "Not following this user")
    await db.delete(follow)
    await db.commit()
    return {"status": "unfollowed"}


@router.get("/followers", response_model=List[UserProfilePublic])
async def get_followers(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(UserFollower).where(UserFollower.following_id == current_user["user_id"])
        .options(selectinload(UserFollower.follower))
    )
    follows = result.scalars().all()
    return [UserProfilePublic(
        id=f.follower.id,
        full_name=f.follower.full_name,
        avatar_url=f.follower.avatar_url,
        bio=f.follower.bio,
        city=f.follower.city,
        tier=f.follower.tier,
        total_orders=f.follower.total_orders,
        total_spent=float(f.follower.total_spent),
    ) for f in follows]


@router.get("/following", response_model=List[UserProfilePublic])
async def get_following(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(UserFollower).where(UserFollower.follower_id == current_user["user_id"])
        .options(selectinload(UserFollower.following))
    )
    follows = result.scalars().all()
    return [UserProfilePublic(
        id=f.following.id,
        full_name=f.following.full_name,
        avatar_url=f.following.avatar_url,
        bio=f.following.bio,
        city=f.following.city,
        tier=f.following.tier,
        total_orders=f.following.total_orders,
        total_spent=float(f.following.total_spent),
    ) for f in follows]


# ──────────────────────────────────────────────
# 17. COMMUNITY RECOMMENDATIONS
# ──────────────────────────────────────────────

@router.get("/community-recommendations", response_model=List[CommunityRecommendationResponse])
async def get_community_recommendations(
    limit: int = Query(20, le=50),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CommunityRecommendation)
        .options(selectinload(CommunityRecommendation.user), selectinload(CommunityRecommendation.product))
        .order_by(desc(CommunityRecommendation.likes_count), desc(CommunityRecommendation.created_at))
        .limit(limit)
    )
    recs = result.scalars().all()
    return [CommunityRecommendationResponse(
        id=r.id, user_id=r.user_id,
        user_name=r.user.full_name, user_avatar=r.user.avatar_url,
        product_id=r.product_id, product_name=r.product.name,
        recommendation_text=r.recommendation_text,
        likes_count=r.likes_count, created_at=r.created_at,
    ) for r in recs]


@router.post("/community-recommendations", response_model=CommunityRecommendationResponse)
async def create_community_recommendation(
    data: CommunityRecommendationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    rec = CommunityRecommendation(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        product_id=data.product_id,
        recommendation_text=data.recommendation_text,
    )
    db.add(rec)
    await db.commit()
    await db.refresh(rec)
    user_result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = user_result.scalar()
    prod_result = await db.execute(select(Product).where(Product.id == data.product_id))
    prod = prod_result.scalar()
    return CommunityRecommendationResponse(
        id=rec.id, user_id=rec.user_id,
        user_name=user.full_name, user_avatar=user.avatar_url,
        product_id=rec.product_id, product_name=prod.name if prod else None,
        recommendation_text=rec.recommendation_text,
        likes_count=0, created_at=rec.created_at,
    )


# ──────────────────────────────────────────────
# 18. SMART RETURNS
# ──────────────────────────────────────────────

@router.post("/returns", response_model=SmartReturnResponse)
async def create_return(
    data: SmartReturnCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    ret = SmartReturn(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        order_id=data.order_id,
        product_id=data.product_id,
        reason=data.reason,
    )
    db.add(ret)
    await db.commit()
    await db.refresh(ret)
    return ret


@router.get("/returns", response_model=List[SmartReturnResponse])
async def get_returns(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(SmartReturn).where(SmartReturn.user_id == current_user["user_id"])
        .order_by(desc(SmartReturn.created_at))
    )
    return result.scalars().all()


# ──────────────────────────────────────────────
# 19. SUPPORT TICKETS
# ──────────────────────────────────────────────

@router.post("/support-tickets", response_model=SupportTicketResponse)
async def create_ticket(
    data: SupportTicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    ticket = SupportTicket(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        **data.model_dump(),
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return ticket


@router.get("/support-tickets", response_model=List[SupportTicketResponse])
async def get_tickets(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(SupportTicket).where(SupportTicket.user_id == current_user["user_id"])
        .order_by(desc(SupportTicket.created_at))
    )
    return result.scalars().all()


# ──────────────────────────────────────────────
# 20. FEEDBACK
# ──────────────────────────────────────────────

@router.post("/feedback")
async def submit_feedback(
    data: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    fb = Feedback(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        **data.model_dump(),
    )
    db.add(fb)
    await db.commit()
    return {"status": "submitted"}


# ──────────────────────────────────────────────
# 21. THEME PREFERENCES
# ──────────────────────────────────────────────

@router.get("/theme", response_model=ThemePreferenceResponse)
async def get_theme_preference(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(ThemePreference).where(ThemePreference.user_id == current_user["user_id"])
    )
    theme = result.scalar_one_or_none()
    if not theme:
        return ThemePreferenceResponse(theme="dark", accent_color="#6C63FF", font_size="medium", reduced_motion=False, high_contrast=False)
    return theme


@router.put("/theme", response_model=ThemePreferenceResponse)
async def update_theme_preference(
    data: ThemePreferenceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(ThemePreference).where(ThemePreference.user_id == current_user["user_id"])
    )
    theme = result.scalar_one_or_none()
    if not theme:
        theme = ThemePreference(
            id=str(uuid.uuid4()),
            user_id=current_user["user_id"],
            theme=ThemeType.dark,
        )
        db.add(theme)
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(theme, k, v)
    await db.commit()
    await db.refresh(theme)
    return theme


# ──────────────────────────────────────────────
# 22. DASHBOARD LAYOUT
# ──────────────────────────────────────────────

@router.get("/dashboard-layout", response_model=DashboardLayoutResponse)
async def get_dashboard_layout(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(DashboardLayout).where(DashboardLayout.user_id == current_user["user_id"])
    )
    layout = result.scalar_one_or_none()
    if not layout:
        return DashboardLayoutResponse()
    return layout


@router.put("/dashboard-layout", response_model=DashboardLayoutResponse)
async def update_dashboard_layout(
    data: DashboardLayoutUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(DashboardLayout).where(DashboardLayout.user_id == current_user["user_id"])
    )
    layout = result.scalar_one_or_none()
    if not layout:
        layout = DashboardLayout(id=str(uuid.uuid4()), user_id=current_user["user_id"])
        db.add(layout)
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(layout, k, v)
    await db.commit()
    await db.refresh(layout)
    return layout


# ──────────────────────────────────────────────
# 23. ONBOARDING
# ──────────────────────────────────────────────

@router.get("/onboarding", response_model=OnboardingProgressResponse)
async def get_onboarding(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(OnboardingProgress).where(OnboardingProgress.user_id == current_user["user_id"])
    )
    prog = result.scalar_one_or_none()
    if not prog:
        return OnboardingProgressResponse()
    return prog


@router.put("/onboarding")
async def update_onboarding(
    data: OnboardingProgressResponse,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(OnboardingProgress).where(OnboardingProgress.user_id == current_user["user_id"])
    )
    prog = result.scalar_one_or_none()
    if not prog:
        prog = OnboardingProgress(id=str(uuid.uuid4()), user_id=current_user["user_id"])
        db.add(prog)
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(prog, k, v)
    if prog.completed and not prog.completed_at:
        prog.completed_at = datetime.utcnow()
    await db.commit()
    return {"status": "updated"}


# ──────────────────────────────────────────────
# 24. PRODUCT SHARING
# ──────────────────────────────────────────────

@router.post("/share", response_model=ProductShareResponse)
async def share_product(
    data: ProductShareCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    share = ProductShare(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        product_id=data.product_id,
        platform=data.platform,
        share_url=f"https://cognicart.ai/p/{data.product_id}?ref={current_user['user_id'][:8]}",
    )
    db.add(share)
    await db.commit()
    return ProductShareResponse(
        platform=share.platform,
        share_url=share.share_url,
        created_at=share.created_at,
    )


# ──────────────────────────────────────────────
# 25. WISHLIST SHARING
# ──────────────────────────────────────────────

@router.post("/wishlist/share")
async def share_wishlist(
    is_public: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(WishlistShare).where(WishlistShare.user_id == current_user["user_id"])
    )
    share = result.scalar_one_or_none()
    if not share:
        share = WishlistShare(
            id=str(uuid.uuid4()),
            user_id=current_user["user_id"],
            share_code=current_user["user_id"][:8].upper() + "WL",
            is_public=is_public,
        )
        db.add(share)
    else:
        share.is_public = is_public
    await db.commit()
    await db.refresh(share)
    return WishlistShareResponse(
        share_code=share.share_code,
        is_public=share.is_public,
        views_count=share.views_count,
        share_url=f"https://cognicart.ai/wishlist/{share.share_code}",
    )


# ──────────────────────────────────────────────
# 26. SMART COUPON RECOMMENDATIONS
# ──────────────────────────────────────────────

@router.get("/smart-coupons", response_model=List[SmartCouponResponse])
async def get_smart_coupons(
    order_total: float = Query(0.0),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Coupon).where(
            Coupon.is_active == True,
            Coupon.expires_at > datetime.utcnow(),
            Coupon.used_count < Coupon.usage_limit,
        ).order_by(desc(Coupon.discount_value)).limit(5)
    )
    coupons = result.scalars().all()
    user_result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = user_result.scalar()
    recommendations = []
    for c in coupons:
        savings = c.discount_value if c.discount_type == "fixed" else (order_total * c.discount_value / 100)
        if savings > 0:
            recommendations.append(SmartCouponResponse(
                coupon_id=c.id,
                code=c.code,
                discount_type=c.discount_type,
                discount_value=c.discount_value,
                savings_amount=round(min(savings, c.max_discount or savings), 2),
                reason=f"Save {c.discount_value}{'%' if c.discount_type == 'percentage' else ''} on this order",
            ))
    return recommendations[:3]


# ──────────────────────────────────────────────
# 27. SPENDING ANALYTICS
# ──────────────────────────────────────────────

@router.get("/spending-analytics", response_model=UserSpendingResponse)
async def get_spending_analytics(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(UserSpendingAnalysis).where(UserSpendingAnalysis.user_id == current_user["user_id"])
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        # Compute from orders
        orders_result = await db.execute(
            select(Order).where(Order.user_id == current_user["user_id"]).order_by(Order.created_at)
        )
        orders = orders_result.scalars().all()
        monthly = {}
        category_spending = {}
        total_orders = len(orders)
        total_spent = sum(float(o.total) for o in orders)
        avg = total_spent / total_orders if total_orders else 0
        for o in orders:
            month_key = o.created_at.strftime("%Y-%m")
            monthly[month_key] = monthly.get(month_key, 0) + float(o.total)
        return UserSpendingResponse(
            monthly_spending=monthly,
            category_spending=category_spending,
            average_order_value=round(avg, 2),
            total_savings=0.0,
            spending_trend="stable",
        )
    return analysis


# ──────────────────────────────────────────────
# 28. TREND ANALYSIS
# ──────────────────────────────────────────────

@router.get("/trend-analysis", response_model=TrendAnalysisResponse)
async def get_trend_analysis(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(ProductTrendAnalysis).order_by(desc(ProductTrendAnalysis.trend_score)).limit(10)
    )
    trends = result.scalars().all()
    trending_products = []
    for t in trends:
        prod_result = await db.execute(select(Product).where(Product.id == t.product_id))
        prod = prod_result.scalar()
        trending_products.append(ProductTrendResponse(
            product_id=t.product_id,
            product_name=prod.name if prod else "Unknown",
            trend_score=t.trend_score,
            trend_direction=t.trend_direction,
            predicted_popularity=t.predicted_popularity,
        ))
    # Get trending categories
    cat_result = await db.execute(
        select(Product.category_id, func.count(Product.id).label("count"))
        .where(Product.is_active == True, Product.is_trending == True)
        .group_by(Product.category_id).order_by(desc("count")).limit(5)
    )
    categories = cat_result.all()
    return TrendAnalysisResponse(
        trending_products=trending_products,
        trending_categories=[{"category_id": c[0], "product_count": c[1]} for c in categories],
    )


# ──────────────────────────────────────────────
# 29. CUSTOMER LIFETIME VALUE
# ──────────────────────────────────────────────

@router.get("/clv", response_model=CustomerLifetimeValueResponse)
async def get_clv(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(CustomerLifetimeValue).where(CustomerLifetimeValue.user_id == current_user["user_id"])
    )
    clv = result.scalar_one_or_none()
    if not clv:
        user_result = await db.execute(select(User).where(User.id == current_user["user_id"]))
        user = user_result.scalar()
        orders_result = await db.execute(
            select(func.count(Order.id)).where(Order.user_id == current_user["user_id"])
        )
        order_count = orders_result.scalar() or 0
        retention = min(1.0, order_count / 10) if order_count else 0.0
        engagement = min(1.0, (user.total_orders or 0) / 20) if user else 0.0
        predicted = float(user.total_spent * 1.5) if user else 0.0
        return CustomerLifetimeValueResponse(
            clv_score=round((retention + engagement) / 2 * 100, 1),
            retention_score=round(retention * 100, 1),
            engagement_score=round(engagement * 100, 1),
            predicted_clv=round(predicted, 2),
            segment="low" if predicted < 1000 else "medium" if predicted < 10000 else "high",
        )
    return clv


# ──────────────────────────────────────────────
# 30. NOTIFICATION SCHEDULES
# ──────────────────────────────────────────────

@router.get("/notification-schedules", response_model=List[NotificationScheduleResponse])
async def get_notification_schedules(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(NotificationSchedule).where(NotificationSchedule.user_id == current_user["user_id"])
    )
    schedules = result.scalars().all()
    if not schedules:
        default_types = [
            ("price_drop", "in_app"), ("back_in_stock", "in_app"),
            ("recommendation", "in_app"), ("flash_sale", "in_app"),
            ("loyalty_reward", "in_app"), ("order_update", "in_app"),
        ]
        for ntype, channel in default_types:
            db.add(NotificationSchedule(
                id=str(uuid.uuid4()),
                user_id=current_user["user_id"],
                notification_type=NotificationType(ntype),
                channel=channel,
            ))
        await db.commit()
        result = await db.execute(
            select(NotificationSchedule).where(NotificationSchedule.user_id == current_user["user_id"])
        )
        schedules = result.scalars().all()
    return [NotificationScheduleResponse.model_validate(s) for s in schedules]


@router.put("/notification-schedules")
async def update_notification_schedule(
    data: NotificationScheduleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(NotificationSchedule).where(
            NotificationSchedule.user_id == current_user["user_id"],
            NotificationSchedule.notification_type == NotificationType(data.notification_type),
            NotificationSchedule.channel == data.channel,
        )
    )
    schedule = result.scalar_one_or_none()
    if not schedule:
        schedule = NotificationSchedule(
            id=str(uuid.uuid4()),
            user_id=current_user["user_id"],
            notification_type=NotificationType(data.notification_type),
            channel=data.channel,
        )
        db.add(schedule)
    schedule.enabled = data.enabled
    schedule.frequency = data.frequency
    await db.commit()
    return {"status": "updated"}


# ──────────────────────────────────────────────
# 31. SOCIAL PROOF / LIVE COUNTERS
# ──────────────────────────────────────────────

@router.get("/social-proof/{product_id}")
async def get_social_proof(product_id: str, db: AsyncSession = Depends(get_db)):
    from app.models.interaction import UserInteraction
    from datetime import datetime, timedelta
    # Recent purchases (last 24h)
    day_ago = datetime.utcnow() - timedelta(hours=24)
    recent_result = await db.execute(
        select(func.count(UserInteraction.id)).where(
            UserInteraction.product_id == product_id,
            UserInteraction.interaction_type == "purchase",
            UserInteraction.created_at >= day_ago,
        )
    )
    recent_purchases = recent_result.scalar() or 0
    # Currently viewing (last 5 min)
    five_min_ago = datetime.utcnow() - timedelta(minutes=5)
    viewing_result = await db.execute(
        select(func.count(UserInteraction.id)).where(
            UserInteraction.product_id == product_id,
            UserInteraction.interaction_type == "view",
            UserInteraction.created_at >= five_min_ago,
        )
    )
    current_viewers = viewing_result.scalar() or 0
    # Total purchases
    total_result = await db.execute(
        select(func.count(UserInteraction.id)).where(
            UserInteraction.product_id == product_id,
            UserInteraction.interaction_type == "purchase",
        )
    )
    total_purchases = total_result.scalar() or 0
    return {
        "purchases_24h": recent_purchases + 28,  # base buffer for demo
        "current_viewers": max(1, current_viewers + 12),
        "total_purchases": total_purchases + 173,
        "stock_status": "low" if False else "normal",
        "stock_count": 3,
    }


# ──────────────────────────────────────────────
# 32. XAI DASHBOARD DATA
# ──────────────────────────────────────────────

@router.get("/xai-dashboard")
async def get_xai_dashboard(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(RecommendationExplanation).where(
            RecommendationExplanation.user_id == current_user["user_id"]
        ).order_by(desc(RecommendationExplanation.created_at)).limit(50)
    )
    explanations = result.scalars().all()
    # Reason type distribution
    reason_types = {}
    engine_contributions = {}
    confidences = []
    feature_importances = {}
    for e in explanations:
        reason_types[e.reason_type] = reason_types.get(e.reason_type, 0) + 1
        confidences.append(e.confidence)
        for k, v in (e.engine_contribution or {}).items():
            engine_contributions[k] = engine_contributions.get(k, 0) + v
        for k, v in (e.feature_importance or {}).items():
            feature_importances[k] = feature_importances.get(k, 0) + v
    total_engine = sum(engine_contributions.values()) or 1
    return {
        "total_explanations": len(explanations),
        "average_confidence": round(sum(confidences) / len(confidences) * 100, 1) if confidences else 0,
        "reason_type_distribution": reason_types,
        "engine_contribution": {k: round(v / total_engine * 100, 1) for k, v in engine_contributions.items()},
        "feature_importance": {k: round(v, 3) for k, v in sorted(feature_importances.items(), key=lambda x: -x[1])[:10]},
        "recent_explanations": [
            {
                "product_id": e.product_id,
                "reason": e.reason,
                "reason_type": e.reason_type,
                "confidence": round(e.confidence * 100, 1),
            }
            for e in explanations[:10]
        ],
    }
