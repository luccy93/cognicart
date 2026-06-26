import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, text
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.auth.jwt import get_current_user
from app.models.user import User
from app.models.product import Product, Category
from app.models.order import Order, OrderItem
from app.models.interaction import Review, Wishlist, BrowsingHistory
from app.models.feature_extensions import (
    ShoppingDNA, AITask, TrackedProduct, AutoBuyRule,
    PricePrediction, GiftRecommendation, ReorderPrediction,
    XPLevel, Achievement, UserPreference, ARSession,
)
from app.schemas.feature_extensions import *
from app.ai.shopping_dna_service import (
    analyze_shopping_dna, check_achievements,
    generate_concierge_messages, generate_homepage_data,
    generate_price_prediction, generate_gift_recommendations,
    predict_reorder,
)

router = APIRouter(prefix="/api/ai", tags=["AI Features"])


# ──────────────────────────────────────────────
# 1. SHOPPING DNA
# ──────────────────────────────────────────────

@router.get("/shopping-dna", response_model=ShoppingDNAResponse)
async def get_shopping_dna(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(ShoppingDNA).where(ShoppingDNA.user_id == current_user["user_id"])
    )
    dna = result.scalar_one_or_none()
    if not dna:
        dna = await analyze_shopping_dna(current_user["user_id"], db)
    return dna


# ──────────────────────────────────────────────
# 2. AI TASKS
# ──────────────────────────────────────────────

@router.get("/tasks", response_model=List[AITaskResponse])
async def list_ai_tasks(
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = select(AITask).where(AITask.user_id == current_user["user_id"])
    if status:
        query = query.where(AITask.status == status)
    query = query.order_by(desc(AITask.created_at))
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/tasks", response_model=AITaskResponse)
async def create_ai_task(
    data: AITaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    task = AITask(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        task_type=data.task_type,
        title=data.title,
        description=data.description,
        params=data.params,
        scheduled_at=data.scheduled_at,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.get("/tasks/{task_id}", response_model=AITaskResponse)
async def get_ai_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(AITask).where(AITask.id == task_id, AITask.user_id == current_user["user_id"])
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    return task


@router.put("/tasks/{task_id}", response_model=AITaskResponse)
async def update_ai_task(
    task_id: str,
    data: AITaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(AITask).where(AITask.id == task_id, AITask.user_id == current_user["user_id"])
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(task, k, v)
    if data.status == "completed":
        task.completed_at = datetime.utcnow()
    task.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/tasks/{task_id}")
async def delete_ai_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(AITask).where(AITask.id == task_id, AITask.user_id == current_user["user_id"])
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    await db.delete(task)
    await db.commit()
    return {"status": "deleted"}


@router.post("/tasks/{task_id}/execute", response_model=AITaskResponse)
async def execute_ai_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(AITask).where(AITask.id == task_id, AITask.user_id == current_user["user_id"])
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    task.status = "completed"
    task.progress = 100
    task.completed_at = datetime.utcnow()
    task.result = {"executed": True, "completed_at": datetime.utcnow().isoformat()}
    task.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(task)
    return task


# ──────────────────────────────────────────────
# 3. TRACKED PRODUCTS
# ──────────────────────────────────────────────

@router.get("/tracked-products", response_model=List[TrackedProductResponse])
async def list_tracked_products(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(TrackedProduct)
        .where(TrackedProduct.user_id == current_user["user_id"])
        .options(selectinload(TrackedProduct.product))
        .order_by(desc(TrackedProduct.created_at))
    )
    items = result.scalars().all()
    response = []
    for tp in items:
        prod = tp.product
        response.append(TrackedProductResponse(
            id=tp.id, product_id=tp.product_id,
            product_name=prod.name if prod else None,
            product_image=prod.thumbnail_url if prod else None,
            current_price=prod.price if prod else None,
            target_price=tp.target_price,
            price_drop_threshold=tp.price_drop_threshold,
            notify_on_price_drop=tp.notify_on_price_drop,
            notify_on_stock=tp.notify_on_stock,
            auto_buy_enabled=tp.auto_buy_enabled,
            auto_buy_max_price=tp.auto_buy_max_price,
            is_active=tp.is_active,
            last_checked_price=tp.last_checked_price,
            lowest_price_seen=tp.lowest_price_seen,
            highest_price_seen=tp.highest_price_seen,
            price_history=tp.price_history or [],
            created_at=tp.created_at,
        ))
    return response


@router.post("/tracked-products", response_model=TrackedProductResponse)
async def track_product(
    data: TrackedProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    prod_result = await db.execute(select(Product).where(Product.id == data.product_id))
    product = prod_result.scalar_one_or_none()
    if not product:
        raise HTTPException(404, "Product not found")
    existing = await db.execute(
        select(TrackedProduct).where(
            TrackedProduct.user_id == current_user["user_id"],
            TrackedProduct.product_id == data.product_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Product already tracked")
    tp = TrackedProduct(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        product_id=data.product_id,
        target_price=data.target_price,
        price_drop_threshold=data.price_drop_threshold,
        notify_on_price_drop=data.notify_on_price_drop,
        notify_on_stock=data.notify_on_stock,
        auto_buy_enabled=data.auto_buy_enabled,
        auto_buy_max_price=data.auto_buy_max_price,
        notes=data.notes,
        last_checked_price=product.price,
        lowest_price_seen=product.price,
        highest_price_seen=product.price,
    )
    db.add(tp)
    await db.commit()
    await db.refresh(tp)
    return TrackedProductResponse(
        id=tp.id, product_id=tp.product_id,
        product_name=product.name, product_image=product.thumbnail_url,
        current_price=product.price, target_price=tp.target_price,
        price_drop_threshold=tp.price_drop_threshold,
        notify_on_price_drop=tp.notify_on_price_drop,
        notify_on_stock=tp.notify_on_stock,
        auto_buy_enabled=tp.auto_buy_enabled,
        auto_buy_max_price=tp.auto_buy_max_price,
        is_active=tp.is_active,
        last_checked_price=tp.last_checked_price,
        lowest_price_seen=tp.lowest_price_seen,
        highest_price_seen=tp.highest_price_seen,
        price_history=tp.price_history or [],
        created_at=tp.created_at,
    )


@router.put("/tracked-products/{tracked_id}", response_model=TrackedProductResponse)
async def update_tracked_product(
    tracked_id: str,
    data: TrackedProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(TrackedProduct).where(
            TrackedProduct.id == tracked_id,
            TrackedProduct.user_id == current_user["user_id"],
        ).options(selectinload(TrackedProduct.product))
    )
    tp = result.scalar_one_or_none()
    if not tp:
        raise HTTPException(404, "Tracked product not found")
    update_data = data.model_dump(exclude_unset=True, exclude={"product_id"})
    for k, v in update_data.items():
        setattr(tp, k, v)
    tp.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(tp)
    prod = tp.product
    return TrackedProductResponse(
        id=tp.id, product_id=tp.product_id,
        product_name=prod.name if prod else None,
        product_image=prod.thumbnail_url if prod else None,
        current_price=prod.price if prod else None,
        target_price=tp.target_price,
        price_drop_threshold=tp.price_drop_threshold,
        notify_on_price_drop=tp.notify_on_price_drop,
        notify_on_stock=tp.notify_on_stock,
        auto_buy_enabled=tp.auto_buy_enabled,
        auto_buy_max_price=tp.auto_buy_max_price,
        is_active=tp.is_active,
        last_checked_price=tp.last_checked_price,
        lowest_price_seen=tp.lowest_price_seen,
        highest_price_seen=tp.highest_price_seen,
        price_history=tp.price_history or [],
        created_at=tp.created_at,
    )


@router.delete("/tracked-products/{tracked_id}")
async def delete_tracked_product(
    tracked_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(TrackedProduct).where(
            TrackedProduct.id == tracked_id,
            TrackedProduct.user_id == current_user["user_id"],
        )
    )
    tp = result.scalar_one_or_none()
    if not tp:
        raise HTTPException(404, "Tracked product not found")
    await db.delete(tp)
    await db.commit()
    return {"status": "deleted"}


# ──────────────────────────────────────────────
# 4. AUTO BUY RULES
# ──────────────────────────────────────────────

@router.get("/auto-buy-rules", response_model=List[AutoBuyRuleResponse])
async def list_auto_buy_rules(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(AutoBuyRule).where(AutoBuyRule.user_id == current_user["user_id"])
        .order_by(desc(AutoBuyRule.created_at))
    )
    return result.scalars().all()


@router.post("/auto-buy-rules", response_model=AutoBuyRuleResponse)
async def create_auto_buy_rule(
    data: AutoBuyRuleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    rule = AutoBuyRule(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        **data.model_dump(),
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return rule


@router.put("/auto-buy-rules/{rule_id}", response_model=AutoBuyRuleResponse)
async def update_auto_buy_rule(
    rule_id: str,
    data: AutoBuyRuleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(AutoBuyRule).where(
            AutoBuyRule.id == rule_id,
            AutoBuyRule.user_id == current_user["user_id"],
        )
    )
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(404, "Auto-buy rule not found")
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(rule, k, v)
    rule.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(rule)
    return rule


@router.delete("/auto-buy-rules/{rule_id}")
async def delete_auto_buy_rule(
    rule_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(AutoBuyRule).where(
            AutoBuyRule.id == rule_id,
            AutoBuyRule.user_id == current_user["user_id"],
        )
    )
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(404, "Auto-buy rule not found")
    await db.delete(rule)
    await db.commit()
    return {"status": "deleted"}


# ──────────────────────────────────────────────
# 5. SMART DEAL PREDICTOR
# ──────────────────────────────────────────────

@router.get("/price-predictions", response_model=List[PricePredictionResponse])
async def list_price_predictions(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(PricePrediction).where(PricePrediction.is_active == True)
        .options(selectinload(PricePrediction.product))
        .order_by(desc(PricePrediction.expected_drop_percentage)).limit(20)
    )
    preds = result.scalars().all()
    response = []
    for p in preds:
        prod = p.product
        response.append(PricePredictionResponse(
            id=p.id, product_id=p.product_id,
            product_name=prod.name if prod else None,
            product_image=prod.thumbnail_url if prod else None,
            current_price=p.current_price,
            predicted_price=p.predicted_price,
            predicted_price_range_min=p.predicted_price_range_min,
            predicted_price_range_max=p.predicted_price_range_max,
            expected_drop_amount=p.expected_drop_amount,
            expected_drop_percentage=p.expected_drop_percentage,
            confidence=p.confidence,
            predicted_drop_date=p.predicted_drop_date,
            prediction_horizon_days=p.prediction_horizon_days,
            factors=p.factors or {},
            created_at=p.created_at,
        ))
    return response


@router.post("/price-predictions/generate", response_model=PricePredictionResponse)
async def generate_prediction(
    product_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    prod_result = await db.execute(select(Product).where(Product.id == product_id))
    product = prod_result.scalar_one_or_none()
    if not product:
        raise HTTPException(404, "Product not found")
    pred = await generate_price_prediction(product_id, db)
    return pred


@router.get("/price-predictions/{product_id}", response_model=PricePredictionResponse)
async def get_product_prediction(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(PricePrediction).where(
            PricePrediction.product_id == product_id,
            PricePrediction.is_active == True,
        ).options(selectinload(PricePrediction.product)).order_by(desc(PricePrediction.created_at)).limit(1)
    )
    pred = result.scalar_one_or_none()
    if not pred:
        raise HTTPException(404, "No prediction found for this product")
    prod = pred.product
    return PricePredictionResponse(
        id=pred.id, product_id=pred.product_id,
        product_name=prod.name if prod else None,
        product_image=prod.thumbnail_url if prod else None,
        current_price=pred.current_price,
        predicted_price=pred.predicted_price,
        predicted_price_range_min=pred.predicted_price_range_min,
        predicted_price_range_max=pred.predicted_price_range_max,
        expected_drop_amount=pred.expected_drop_amount,
        expected_drop_percentage=pred.expected_drop_percentage,
        confidence=pred.confidence,
        predicted_drop_date=pred.predicted_drop_date,
        prediction_horizon_days=pred.prediction_horizon_days,
        factors=pred.factors or {},
        created_at=pred.created_at,
    )


# ──────────────────────────────────────────────
# 6. GIFT RECOMMENDATIONS
# ──────────────────────────────────────────────

@router.post("/gift-recommendations", response_model=GiftRecommendationResponse)
async def create_gift_recommendation(
    data: GiftRecommendationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await generate_gift_recommendations(data, current_user["user_id"], db)


@router.get("/gift-recommendations", response_model=List[GiftRecommendationResponse])
async def list_gift_recommendations(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(GiftRecommendation).where(GiftRecommendation.user_id == current_user["user_id"])
        .order_by(desc(GiftRecommendation.created_at)).limit(20)
    )
    return result.scalars().all()


@router.get("/gift-recommendations/{rec_id}", response_model=GiftRecommendationResponse)
async def get_gift_recommendation(
    rec_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(GiftRecommendation).where(
            GiftRecommendation.id == rec_id,
            GiftRecommendation.user_id == current_user["user_id"],
        )
    )
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(404, "Gift recommendation not found")
    return rec


# ──────────────────────────────────────────────
# 7. REORDER PREDICTIONS
# ──────────────────────────────────────────────

@router.get("/reorder-predictions", response_model=List[ReorderPredictionResponse])
async def list_reorder_predictions(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(ReorderPrediction).where(
            ReorderPrediction.user_id == current_user["user_id"],
            ReorderPrediction.is_active == True,
        ).options(selectinload(ReorderPrediction.product))
        .order_by(desc(ReorderPrediction.confidence)).limit(20)
    )
    preds = result.scalars().all()
    if not preds:
        preds = await predict_reorder(current_user["user_id"], db)
        return preds
    response = []
    for p in preds:
        prod = p.product
        response.append(ReorderPredictionResponse(
            id=p.id, product_id=p.product_id,
            product_name=prod.name if prod else None,
            product_image=prod.thumbnail_url if prod else None,
            predicted_next_order_date=p.predicted_next_order_date,
            confidence=p.confidence,
            frequency_days=p.frequency_days,
            times_purchased=p.times_purchased,
            last_purchased=p.last_purchased,
            is_active=p.is_active,
        ))
    return response


# ──────────────────────────────────────────────
# 8. XP & ACHIEVEMENTS
# ──────────────────────────────────────────────

@router.get("/xp", response_model=XPLevelResponse)
async def get_xp_level(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(XPLevel).where(XPLevel.user_id == current_user["user_id"])
    )
    xp = result.scalar_one_or_none()
    if not xp:
        xp = XPLevel(
            id=str(uuid.uuid4()),
            user_id=current_user["user_id"],
        )
        db.add(xp)
        await db.commit()
        await db.refresh(xp)
    return xp


@router.get("/achievements", response_model=List[AchievementResponse])
async def list_achievements(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(Achievement).where(Achievement.user_id == current_user["user_id"])
        .order_by(desc(Achievement.created_at))
    )
    achievements = result.scalars().all()
    return [AchievementResponse.model_validate(a) for a in achievements]


@router.post("/achievements/check")
async def check_user_achievements(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    new_earned = await check_achievements(current_user["user_id"], db)
    return {"new_achievements": new_earned, "checked": True}


# ──────────────────────────────────────────────
# 9. USER PREFERENCES
# ──────────────────────────────────────────────

@router.get("/preferences", response_model=UserPreferenceResponse)
async def get_user_preferences(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(UserPreference).where(UserPreference.user_id == current_user["user_id"])
    )
    pref = result.scalar_one_or_none()
    if not pref:
        return UserPreferenceResponse()
    return pref


@router.put("/preferences", response_model=UserPreferenceResponse)
async def update_user_preferences(
    data: UserPreferenceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(UserPreference).where(UserPreference.user_id == current_user["user_id"])
    )
    pref = result.scalar_one_or_none()
    if not pref:
        pref = UserPreference(id=str(uuid.uuid4()), user_id=current_user["user_id"])
        db.add(pref)
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(pref, k, v)
    pref.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(pref)
    return pref


# ──────────────────────────────────────────────
# 10. CONCIERGE (PROACTIVE ASSISTANT)
# ──────────────────────────────────────────────

@router.get("/concierge/messages", response_model=List[ConciergeMessageResponse])
async def get_concierge_messages(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    messages = await generate_concierge_messages(current_user["user_id"], db)
    return messages


@router.post("/concierge/dismiss/{message_id}")
async def dismiss_concierge_message(
    message_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return {"status": "dismissed", "message_id": message_id}


# ──────────────────────────────────────────────
# 11. DYNAMIC HOMEPAGE
# ──────────────────────────────────────────────

@router.get("/homepage", response_model=DynamicHomepageResponse)
async def get_dynamic_homepage(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    data = await generate_homepage_data(current_user["user_id"], db)
    return data


# ──────────────────────────────────────────────
# 12. AR SESSIONS
# ──────────────────────────────────────────────

@router.get("/ar-sessions", response_model=List[ARSessionResponse])
async def list_ar_sessions(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(ARSession).where(ARSession.user_id == current_user["user_id"])
        .order_by(desc(ARSession.created_at)).limit(20)
    )
    return result.scalars().all()


@router.post("/ar-sessions", response_model=ARSessionResponse)
async def create_ar_session(
    data: ARSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    session = ARSession(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        product_id=data.product_id,
        session_type=data.session_type,
        image_url=data.image_url,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.put("/ar-sessions/{session_id}", response_model=ARSessionResponse)
async def update_ar_session(
    session_id: str,
    data: ARSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(ARSession).where(
            ARSession.id == session_id,
            ARSession.user_id == current_user["user_id"],
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(404, "AR session not found")
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(session, k, v)
    session.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(session)
    return session
