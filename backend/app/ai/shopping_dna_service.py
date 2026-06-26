import uuid
import random
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.models.product import Product, Category
from app.models.order import Order, OrderItem
from app.models.interaction import Review, Wishlist, BrowsingHistory
from app.models.feature_extensions import (
    ShoppingDNA, Achievement, XPLevel, TrackedProduct,
    PricePrediction, GiftRecommendation, ReorderPrediction,
)
from app.schemas.feature_extensions import (
    ShoppingDNAResponse, PricePredictionResponse,
    GiftRecommendationResponse, ConciergeMessageResponse,
    DynamicHomepageResponse, ReorderPredictionResponse,
)


async def analyze_shopping_dna(user_id: str, db: AsyncSession) -> ShoppingDNAResponse:
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        return ShoppingDNAResponse()

    orders_result = await db.execute(
        select(Order).where(Order.user_id == user_id).order_by(Order.created_at)
    )
    orders = orders_result.scalars().all()
    total_orders = len(orders)
    total_spent = sum(float(o.total) for o in orders)

    reviews_result = await db.execute(
        select(func.count(Review.id)).where(Review.user_id == user_id)
    )
    review_count = reviews_result.scalar() or 0

    wishlist_result = await db.execute(
        select(func.count(Wishlist.id)).where(Wishlist.user_id == user_id)
    )
    wishlist_count = wishlist_result.scalar() or 0

    browsing_result = await db.execute(
        select(func.count(BrowsingHistory.id)).where(BrowsingHistory.user_id == user_id)
    )
    browsing_count = browsing_result.scalar() or 0

    category_purchases = {}
    for o in orders:
        items_result = await db.execute(
            select(OrderItem).where(OrderItem.order_id == o.id)
            .options(selectinload(OrderItem.product))
        )
        items = items_result.scalars().all()
        for item in items:
            if item.product and item.product.category_id:
                cat_id = item.product.category_id
                category_purchases[cat_id] = category_purchases.get(cat_id, 0) + 1

    category_names = {}
    for cat_id in category_purchases:
        cat_result = await db.execute(select(Category).where(Category.id == cat_id))
        cat = cat_result.scalar_one_or_none()
        if cat:
            category_names[cat.name] = category_purchases[cat_id]

    avg_monthly = total_spent / max(1, total_orders) if total_spent > 0 else 0

    persona_type, persona_label, shopping_pattern, price_sensitivity = compute_persona({
        "total_orders": total_orders,
        "total_spent": total_spent,
        "review_count": review_count,
        "wishlist_count": wishlist_count,
        "browsing_count": browsing_count,
        "avg_monthly": avg_monthly,
    })

    brand_result = await db.execute(
        select(OrderItem).options(selectinload(OrderItem.product))
        .where(OrderItem.order_id.in_(select(Order.id).where(Order.user_id == user_id)))
        .limit(100)
    )
    brand_items = brand_result.scalars().all()
    brand_counts = {}
    for item in brand_items:
        if item.product and item.product.brand:
            brand_counts[item.product.brand] = brand_counts.get(item.product.brand, 0) + 1
    top_brands = sorted(brand_counts.items(), key=lambda x: -x[1])[:5]
    preferred_brands = [b[0] for b in top_brands]

    now = datetime.utcnow()
    dna = ShoppingDNA(
        id=str(uuid.uuid4()),
        user_id=user_id,
        persona_type=persona_type,
        persona_label=persona_label,
        confidence=min(0.95, 0.5 + (total_orders * 0.05)),
        preferred_brands=preferred_brands,
        preferred_categories=list(category_names.keys()),
        average_monthly_spend=round(avg_monthly, 2),
        shopping_pattern=shopping_pattern,
        price_sensitivity=price_sensitivity,
        brand_loyalty_score=round(min(1.0, len(preferred_brands) * 0.2), 2),
        category_affinity_scores=category_names,
        purchase_frequency="daily" if total_orders > 50 else "weekly" if total_orders > 20 else "monthly",
        average_cart_value=round(avg_monthly, 2),
        features={
            "total_orders": total_orders,
            "total_spent": round(total_spent, 2),
            "review_count": review_count,
            "wishlist_count": wishlist_count,
            "browsing_count": browsing_count,
        },
        last_analyzed=now,
    )
    db.add(dna)
    await db.commit()
    await db.refresh(dna)

    return dna


def compute_persona(user_data: dict) -> tuple:
    total_orders = user_data.get("total_orders", 0)
    total_spent = user_data.get("total_spent", 0)
    avg_monthly = user_data.get("avg_monthly", 0)

    if total_spent > 50000:
        return "premium_shopper", "Premium Shopper", "weekend_shopper", "low"

    if total_orders > 20:
        return "frequent_buyer", "Frequent Buyer", "daily_browser", "medium"

    if total_orders > 5 and avg_monthly > 200:
        return "deal_hunter", "Deal Hunter", "deal_hunter", "high"

    if total_orders > 2:
        return "budget_shopper", "Budget Shopper", "weekend_shopper", "high"

    return "window_shopper", "Window Shopper", "casual", "medium"


async def generate_price_prediction(product_id: str, db: AsyncSession) -> PricePredictionResponse:
    prod_result = await db.execute(select(Product).where(Product.id == product_id))
    product = prod_result.scalar_one_or_none()
    if not product:
        raise Exception("Product not found")

    current_price = product.price or 0
    base_drop = random.uniform(0.05, 0.20)
    confidence = random.uniform(0.6, 0.95)
    drop_amount = current_price * base_drop
    predicted_price = current_price - drop_amount
    predicted_drop_date = datetime.utcnow() + timedelta(days=random.randint(3, 14))
    range_min = predicted_price * 0.9
    range_max = predicted_price * 1.1

    factors = {
        "seasonal_demand": round(random.uniform(0.5, 1.0), 2),
        "competitor_pricing": round(random.uniform(0.3, 0.9), 2),
        "historical_trend": round(random.uniform(0.4, 0.8), 2),
        "stock_level": "high" if random.random() > 0.5 else "low",
    }

    pred = PricePrediction(
        id=str(uuid.uuid4()),
        product_id=product_id,
        current_price=current_price,
        predicted_price=round(predicted_price, 2),
        predicted_price_range_min=round(range_min, 2),
        predicted_price_range_max=round(range_max, 2),
        expected_drop_amount=round(drop_amount, 2),
        expected_drop_percentage=round(base_drop * 100, 1),
        confidence=round(confidence, 2),
        predicted_drop_date=predicted_drop_date,
        prediction_horizon_days=random.randint(7, 30),
        factors=factors,
    )
    db.add(pred)
    await db.commit()
    await db.refresh(pred)

    return PricePredictionResponse(
        id=pred.id, product_id=pred.product_id,
        product_name=product.name, product_image=product.thumbnail_url,
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


async def generate_gift_recommendations(
    request: "GiftRecommendationRequest",
    user_id: str,
    db: AsyncSession,
) -> GiftRecommendationResponse:
    category_map = {
        "birthday": ["electronics", "fashion", "books", "toys", "home"],
        "anniversary": ["fashion", "jewelry", "home", "electronics"],
        "wedding": ["home", "electronics", "fashion"],
        "diwali": ["electronics", "home", "fashion", "decor"],
        "christmas": ["toys", "electronics", "fashion", "books", "home"],
    }

    categories_to_search = category_map.get(request.occasion.lower(), ["electronics", "fashion"])
    if request.interests:
        interest_cats = [i.lower() for i in request.interests if i.lower() in
                         ["electronics", "fashion", "books", "toys", "home", "sports", "beauty"]]
        if interest_cats:
            categories_to_search = interest_cats + [c for c in categories_to_search if c not in interest_cats]

    cat_result = await db.execute(
        select(Category).where(Category.name.in_(categories_to_search[:3]), Category.is_active == True)
    )
    matching_cats = cat_result.scalars().all()
    cat_ids = [c.id for c in matching_cats]

    recommended_items = []
    if cat_ids and request.budget > 0:
        budget_max = request.budget * 1.2
        budget_min = request.budget * 0.3
        prod_result = await db.execute(
            select(Product).where(
                Product.category_id.in_(cat_ids),
                Product.is_active == True,
                Product.price >= budget_min,
                Product.price <= budget_max,
            ).order_by(desc(Product.average_rating)).limit(5)
        )
        recommended_items = prod_result.scalars().all()

    if not recommended_items:
        prod_result = await db.execute(
            select(Product).where(
                Product.is_active == True,
                Product.is_featured == True,
            ).order_by(desc(Product.average_rating)).limit(3)
        )
        recommended_items = prod_result.scalars().all()

    bundle_items = recommended_items[:min(3, len(recommended_items))]
    total_bundle = sum(float(p.price) for p in bundle_items)

    rec = GiftRecommendation(
        id=str(uuid.uuid4()),
        user_id=user_id,
        recipient_name=request.recipient_name,
        recipient_age_group=request.recipient_age_group,
        relationship=request.relationship,
        occasion=request.occasion,
        budget=request.budget,
        interests=request.interests,
        personality_type=request.personality_type,
        recommended_product_ids=[p.id for p in recommended_items],
        bundle_product_ids=[p.id for p in bundle_items],
        total_bundle_price=round(total_bundle, 2),
        reasoning=f"Perfect {request.occasion} gifts based on your budget of ${request.budget:.2f}. "
                  f"We found {len(recommended_items)} items that match your preferences."
                  + (f" Great for your {request.relationship}!" if request.relationship else ""),
    )
    db.add(rec)
    await db.commit()
    await db.refresh(rec)

    return GiftRecommendationResponse(
        id=rec.id,
        recipient_name=rec.recipient_name,
        occasion=rec.occasion,
        budget=rec.budget or 0.0,
        recommended_products=[
            {"id": p.id, "name": p.name, "price": p.price, "image": p.thumbnail_url,
             "rating": p.average_rating} for p in recommended_items
        ],
        bundle_products=[
            {"id": p.id, "name": p.name, "price": p.price, "image": p.thumbnail_url} for p in bundle_items
        ],
        total_bundle_price=rec.total_bundle_price,
        reasoning=rec.reasoning,
        created_at=rec.created_at,
    )


async def check_achievements(user_id: str, db: AsyncSession) -> list:
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        return []

    orders_count = user.total_orders or 0
    reviews_result = await db.execute(
        select(func.count(Review.id)).where(Review.user_id == user_id)
    )
    reviews_count = reviews_result.scalar() or 0

    xp_result = await db.execute(select(XPLevel).where(XPLevel.user_id == user_id))
    xp_level = xp_result.scalar_one_or_none()
    if not xp_level:
        xp_level = XPLevel(id=str(uuid.uuid4()), user_id=user_id)
        db.add(xp_level)
        await db.flush()

    achievement_defs = [
        {"key": "first_purchase", "title": "First Purchase", "category": "shopping",
         "progress_target": 1, "condition": orders_count >= 1, "xp": 50},
        {"key": "shopaholic", "title": "Shopaholic", "category": "shopping",
         "progress_target": 10, "condition": orders_count >= 10, "xp": 200},
        {"key": "big_spender", "title": "Big Spender", "category": "shopping",
         "progress_target": 1, "condition": float(user.total_spent or 0) >= 10000, "xp": 500},
        {"key": "reviewer", "title": "First Review", "category": "social",
         "progress_target": 1, "condition": reviews_count >= 1, "xp": 30},
        {"key": "top_reviewer", "title": "Top Reviewer", "category": "social",
         "progress_target": 5, "condition": reviews_count >= 5, "xp": 150},
        {"key": "bronze_tier", "title": "Bronze Member", "category": "loyalty",
         "progress_target": 1, "condition": (user.loyalty_points or 0) >= 100, "xp": 100},
        {"key": "silver_tier", "title": "Silver Member", "category": "loyalty",
         "progress_target": 1, "condition": (user.loyalty_points or 0) >= 500, "xp": 300},
        {"key": "gold_tier", "title": "Gold Member", "category": "loyalty",
         "progress_target": 1, "condition": (user.loyalty_points or 0) >= 1000, "xp": 500},
    ]

    new_earned = []
    for adef in achievement_defs:
        result = await db.execute(
            select(Achievement).where(
                Achievement.user_id == user_id,
                Achievement.achievement_key == adef["key"],
            )
        )
        ach = result.scalar_one_or_none()
        if not ach:
            progress = orders_count if adef["key"] in ("first_purchase", "shopaholic") else (
                1 if adef["condition"] else 0
            )
            is_earned = adef["condition"]
            ach = Achievement(
                id=str(uuid.uuid4()),
                user_id=user_id,
                achievement_key=adef["key"],
                title=adef["title"],
                category=adef["category"],
                progress_current=progress,
                progress_target=adef["progress_target"],
                is_earned=is_earned,
                earned_at=datetime.utcnow() if is_earned else None,
                xp_reward=adef["xp"],
            )
            db.add(ach)
            if is_earned:
                new_earned.append(adef["key"])
                xp_level.current_xp += adef["xp"]
                xp_level.total_xp_earned += adef["xp"]
        elif not ach.is_earned and adef["condition"]:
            ach.is_earned = True
            ach.earned_at = datetime.utcnow()
            ach.progress_current = adef["progress_target"]
            new_earned.append(adef["key"])
            xp_level.current_xp += adef["xp"]
            xp_level.total_xp_earned += adef["xp"]

    full_xp = xp_level.total_xp_earned
    if full_xp >= 5000:
        xp_level.level_title = "Legend"
        xp_level.level = 7
        xp_level.xp_to_next_level = 9999
    elif full_xp >= 2000:
        xp_level.level_title = "Diamond"
        xp_level.level = 6
        xp_level.xp_to_next_level = 5000
    elif full_xp >= 1000:
        xp_level.level_title = "Platinum"
        xp_level.level = 5
        xp_level.xp_to_next_level = 2000
    elif full_xp >= 500:
        xp_level.level_title = "Gold"
        xp_level.level = 4
        xp_level.xp_to_next_level = 1000
    elif full_xp >= 200:
        xp_level.level_title = "Silver"
        xp_level.level = 3
        xp_level.xp_to_next_level = 500
    elif full_xp >= 50:
        xp_level.level_title = "Bronze"
        xp_level.level = 2
        xp_level.xp_to_next_level = 200

    await db.commit()
    return new_earned


async def generate_concierge_messages(user_id: str, db: AsyncSession) -> list:
    messages = []
    hour = datetime.utcnow().hour

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    name = user.full_name.split()[0] if user else "there"

    if hour < 12:
        greeting = f"Good morning, {name}! ☀️"
    elif hour < 17:
        greeting = f"Good afternoon, {name}! 🌤️"
    else:
        greeting = f"Good evening, {name}! 🌙"

    messages.append(ConciergeMessageResponse(
        id=str(uuid.uuid4()),
        type="recommendation",
        title="Welcome back!",
        message=greeting,
        priority="normal",
        created_at=datetime.utcnow(),
    ))

    tracked_result = await db.execute(
        select(TrackedProduct).where(
            TrackedProduct.user_id == user_id,
            TrackedProduct.is_active == True,
        ).options(selectinload(TrackedProduct.product)).limit(5)
    )
    tracked = tracked_result.scalars().all()
    for tp in tracked:
        if tp.product and tp.target_price and tp.product.price <= tp.target_price:
            messages.append(ConciergeMessageResponse(
                id=str(uuid.uuid4()),
                type="price_drop",
                title="Price Drop Alert!",
                message=f"{tp.product.name} is now ${tp.product.price:.2f} (below your target of ${tp.target_price:.2f})",
                priority="high",
                action_url=f"/product/{tp.product_id}",
                action_label="View Deal",
                product_id=tp.product_id,
                product_name=tp.product.name,
                product_image=tp.product.thumbnail_url,
                created_at=datetime.utcnow(),
            ))

    wishlist_result = await db.execute(
        select(Wishlist).where(Wishlist.user_id == user_id)
        .options(selectinload(Wishlist.product)).limit(5)
    )
    wishlist_items = wishlist_result.scalars().all()
    for wl in wishlist_items:
        if wl.product and wl.product.is_featured:
            messages.append(ConciergeMessageResponse(
                id=str(uuid.uuid4()),
                type="deal",
                title="Wishlist Deal!",
                message=f"{wl.product.name} from your wishlist is now on sale!",
                priority="normal",
                action_url=f"/product/{wl.product_id}",
                action_label="Check Price",
                product_id=wl.product_id,
                product_name=wl.product.name,
                product_image=wl.product.thumbnail_url,
                created_at=datetime.utcnow(),
            ))
            break

    reorder_result = await db.execute(
        select(ReorderPrediction).where(
            ReorderPrediction.user_id == user_id,
            ReorderPrediction.is_active == True,
        ).options(selectinload(ReorderPrediction.product)).limit(3)
    )
    reorders = reorder_result.scalars().all()
    for ro in reorders:
        if ro.product and ro.predicted_next_order_date:
            days_until = (ro.predicted_next_order_date - datetime.utcnow()).days
            if 0 <= days_until <= 3:
                messages.append(ConciergeMessageResponse(
                    id=str(uuid.uuid4()),
                    type="reorder",
                    title="Time to Reorder!",
                    message=f"Time to reorder {ro.product.name} based on your purchase history",
                    priority="normal",
                    action_url=f"/product/{ro.product_id}",
                    action_label="Reorder Now",
                    product_id=ro.product_id,
                    product_name=ro.product.name,
                    product_image=ro.product.thumbnail_url,
                    created_at=datetime.utcnow(),
                ))

    cart_result = await db.execute(
        select(OrderItem).where(
            OrderItem.order_id.in_(
                select(Order.id).where(Order.user_id == user_id, Order.status == "pending")
            )
        ).limit(3)
    )
    cart_items = cart_result.scalars().all()
    if cart_items:
        messages.append(ConciergeMessageResponse(
            id=str(uuid.uuid4()),
            type="cart_reminder",
            title="Complete Your Order",
            message="You have items waiting in your cart. Complete your purchase now!",
            priority="normal",
            action_url="/checkout",
            action_label="Go to Checkout",
            created_at=datetime.utcnow(),
        ))

    return messages


async def generate_homepage_data(user_id: str, db: AsyncSession) -> DynamicHomepageResponse:
    hour = datetime.utcnow().hour

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    name = user.full_name.split()[0] if user else "there"

    if hour < 12:
        greeting = f"Good morning, {name}"
        time_banner = "Start your day with these fresh picks!"
    elif hour < 17:
        greeting = f"Good afternoon, {name}"
        time_banner = "Afternoon deals just for you!"
    else:
        greeting = f"Good evening, {name}"
        time_banner = "Evening wind-down? Here are some cozy picks."

    pref_result = await db.execute(
        select(select(UserPreference).where(UserPreference.user_id == user_id).exists())
    )
    has_pref = pref_result.scalar()
    theme = "default"
    if has_pref:
        pref_result2 = await db.execute(
            select(UserPreference).where(UserPreference.user_id == user_id)
        )
        pref = pref_result2.scalar_one_or_none()
        theme = pref.storefront_theme if pref else "default"

    cat_result = await db.execute(
        select(Category).where(Category.is_active == True).limit(6)
    )
    categories = cat_result.scalars().all()
    featured_cats = [
        {"id": c.id, "name": c.name, "slug": c.slug, "image": c.image_url}
        for c in categories
    ]

    hero_result = await db.execute(
        select(Product).where(
            Product.is_active == True,
            Product.is_featured == True,
        ).order_by(desc(Product.average_rating)).limit(4)
    )
    hero_products = [
        {"id": p.id, "name": p.name, "price": p.price, "image": p.thumbnail_url,
         "rating": p.average_rating} for p in hero_result.scalars().all()
    ]

    deal_result = await db.execute(
        select(Product).where(
            Product.is_active == True,
            Product.original_price.isnot(None),
            Product.original_price > Product.price,
        ).order_by(desc(Product.price / Product.original_price)).limit(6)
    )
    deals = [
        {"id": p.id, "name": p.name, "price": p.price, "original_price": p.original_price,
         "image": p.thumbnail_url, "discount": round((1 - p.price / p.original_price) * 100, 1)}
        for p in deal_result.scalars().all() if p.original_price
    ]

    return DynamicHomepageResponse(
        greeting=greeting,
        time_based_banner=time_banner,
        seasonal_banner="Summer Sale - Up to 50% Off!" if 6 <= hour < 18 else "Midnight Flash Sale!",
        featured_categories=featured_cats,
        hero_products=hero_products,
        personalized_deals=deals,
        recommended_sections=["Trending Now", "Based on Your Browsing", "Top Rated", "New Arrivals"],
        storefront_theme=theme,
    )


async def predict_reorder(user_id: str, db: AsyncSession) -> List[ReorderPredictionResponse]:
    orders_result = await db.execute(
        select(OrderItem.product_id, func.count(OrderItem.id).label("count"),
               func.min(Order.created_at).label("first_order"),
               func.max(Order.created_at).label("last_order"))
        .join(Order, OrderItem.order_id == Order.id)
        .where(Order.user_id == user_id, Order.status.in_(["delivered", "completed"]))
        .group_by(OrderItem.product_id)
        .having(func.count(OrderItem.id) >= 2)
        .order_by(desc("count"))
        .limit(10)
    )
    rows = orders_result.all()

    predictions = []
    for row in rows:
        prod_id = row[0]
        count = row[1]
        last_order = row[3]

        if last_order and count >= 2:
            days_since = (datetime.utcnow() - last_order).days
            frequency = max(7, days_since // (count - 1) if count > 1 else 30)
            predicted_next = last_order + timedelta(days=frequency)
            confidence = min(0.95, 0.3 + (count * 0.15) - (days_since * 0.01))

            prod_result = await db.execute(select(Product).where(Product.id == prod_id))
            prod = prod_result.scalar_one_or_none()

            reorder = ReorderPrediction(
                id=str(uuid.uuid4()),
                user_id=user_id,
                product_id=prod_id,
                predicted_next_order_date=predicted_next,
                confidence=round(max(0.1, confidence), 2),
                frequency_days=frequency,
                times_purchased=count,
                last_purchased=last_order,
            )
            db.add(reorder)

            predictions.append(ReorderPredictionResponse(
                id=reorder.id, product_id=reorder.product_id,
                product_name=prod.name if prod else None,
                product_image=prod.thumbnail_url if prod else None,
                predicted_next_order_date=reorder.predicted_next_order_date,
                confidence=reorder.confidence,
                frequency_days=reorder.frequency_days,
                times_purchased=reorder.times_purchased,
                last_purchased=reorder.last_purchased,
                is_active=reorder.is_active,
            ))

    await db.commit()
    return predictions
