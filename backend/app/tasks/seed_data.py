"""Seed data script for CogniCart."""
import uuid
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database import Base, sync_engine
from app.models.user import User, UserRole
from app.models.product import Product, Category, ProductImage
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus, PaymentMethod
from app.models.enterprise import OrderTimeline
from app.models.interaction import Rating, Review, BrowsingHistory, Wishlist, UserInteraction, InteractionType
from app.models.recommendation import Recommendation, RecommendationType, RecommendationEngine
from app.models.additional import Address, Coupon, Notification, SearchHistory, Payment, AIInsight, Profile
from app.models.feature_extensions import (
    UserPersona, PersonaType, UserPersonaHistory, RecommendationExplanation,
    LoyaltyPoint, DailyReward, UserStreak, Referral,
    AuditLog, FeatureFlag, ABTest, NPSFeedback,
    PriceAlert, StockAlert, ProductComparison,
    AchievementBadge, BadgeType, UserFollower, CommunityRecommendation,
    SmartReturn, SupportTicket, Feedback, ThemePreference, ThemeType,
    DashboardLayout, OnboardingProgress, ProductShare, WishlistShare,
    SmartCouponRecommendation, UserSpendingAnalysis, ProductTrendAnalysis,
    CustomerLifetimeValue, NotificationSchedule, NotificationType,
)

pwd = CryptContext(schemes=["bcrypt"])


def seed_database(engine=None):
    if engine is None:
        engine = sync_engine

    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        # Users
        admin = User(id=uuid.uuid4(), email="admin@cognicart.ai", password_hash=pwd.hash("Admin@123"),
                     full_name="Admin CogniCart", role=UserRole.SUPER_ADMIN, is_verified=True, is_email_verified=True, tier="Platinum", loyalty_points=10000)
        user1 = User(id=uuid.uuid4(), email="alex@example.com", password_hash=pwd.hash("User@123"),
                     full_name="Alex Johnson", role=UserRole.CUSTOMER, is_verified=True, is_email_verified=True, tier="Gold", loyalty_points=2840,
                     preferred_categories="Electronics, Gaming, Wearables, Smart Devices")
        user2 = User(id=uuid.uuid4(), email="sarah@example.com", password_hash=pwd.hash("User@123"),
                     full_name="Sarah Williams", role=UserRole.CUSTOMER, is_verified=True, is_email_verified=True, tier="Silver", loyalty_points=1500)
        user3 = User(id=uuid.uuid4(), email="mike@example.com", password_hash=pwd.hash("User@123"),
                     full_name="Mike Chen", role=UserRole.CUSTOMER, is_verified=True, is_email_verified=True, tier="Bronze", loyalty_points=450)
        session.add_all([admin, user1, user2, user3])
        session.flush()
        users = [admin, user1, user2, user3]

        # Profiles
        for u in [user1, user2, user3]:
            session.add(Profile(user_id=u.id, bio=f"{u.full_name}'s profile", interests="tech, gaming, gadgets", notification_preferences={"email": True, "push": True}))
        session.flush()

        # Addresses
        for u in [user1, user2, user3]:
            session.add(Address(user_id=u.id, full_name=u.full_name, phone="+1-555-0100",
                                street=f"{random.randint(100, 999)} Main St", city="San Francisco",
                                state="CA", postal_code=f"94{random.randint(100, 999)}", country="US", is_default=True))
        session.flush()

        # Categories
        cat_data = [
            ("Electronics", "electronics", "Laptops, phones, tablets", "💻", 1),
            ("Fashion", "fashion", "Clothing, accessories", "👕", 2),
            ("Gaming", "gaming", "Gaming gear & accessories", "🎮", 3),
            ("Smart Devices", "smart-devices", "Smart home, wearables", "📱", 4),
            ("Accessories", "accessories", "Chargers, cases, cables", "⌚", 5),
            ("Home Appliances", "home-appliances", "Kitchen, home gadgets", "🏠", 6),
        ]
        categories = []
        for name, slug, desc, icon, order in cat_data:
            c = Category(id=uuid.uuid4(), name=name, slug=slug, description=desc, icon=icon, sort_order=order)
            session.add(c)
            categories.append(c)
        session.flush()

        # Products (50 products)
        product_names = [
            "Wireless Earbuds Pro", "Mechanical Keyboard RGB", "Smart Watch Ultra",
            "Gaming Mouse X", "Noise Cancelling Headphones", "USB-C Hub 7-in-1",
            "Portable SSD 1TB", "Smart Home Hub", "Ergonomic Chair Pro",
            "4K Webcam Stream", "Wireless Charger Pad", "Mechanical Keycaps Set",
            "Sony WH-1000XM5", "MacBook Air M3", "Samsung Galaxy Watch 6",
            "Logitech MX Master 3S", "iPad Air M2", "DJI Mini 4 Pro",
            "Kindle Scribe", "AirPods Pro 2", "Dell UltraSharp 27\" 4K",
            "Razer DeathAdder V3", "JBL Flip 6", "Anker Power Bank 20K",
            "Bose QuietComfort Earbuds", "iPad Mini 7", "Kindle Paperwhite",
            "Samsung Galaxy Tab S9", "Herman Miller Chair", "Mac Studio M2 Max",
            "Sony A7IV Camera", "GoPro Hero 12", "Ring Video Doorbell Pro",
            "Nest Learning Thermostat", "Philips Hue Starter Kit", "Dyson V15 Detect",
            "Instant Pot Duo Plus", "KitchenAid Stand Mixer", "Breville Barista Express",
            "Samsung 49\" Ultrawide", "Corsair K100 RGB", "SteelSeries Arctis Pro",
            "AMD Ryzen 9 7950X", "NVIDIA RTX 4090", "Samsung 990 Pro 2TB",
            "LG C3 77\" OLED", "Apple Vision Pro", "Meta Quest 3",
            "ASUS ROG Ally", "Framework Laptop 16",
        ]
        products = []
        for i, name in enumerate(product_names):
            cat = categories[i % len(categories)]
            price = round(random.uniform(19.99, 1999.99), 2)
            orig = round(price * random.uniform(1.1, 1.4), 2)
            p = Product(
                id=uuid.uuid4(), name=name, slug=name.lower().replace(" ", "-"),
                description=f"Premium {name} — designed for excellence.",
                short_description=f"High-quality {name} at the best price.",
                price=price, original_price=orig if random.random() > 0.3 else None,
                stock=random.randint(0, 200), sku=f"COG-{i+1:04d}",
                category_id=cat.id, brand=random.choice(["TechPro", "CogniTech", "SmartGear", "EliteBrand", "PrimeTech"]),
                tags=f"{cat.name.lower()}, premium, tech",
                average_rating=round(random.uniform(3.5, 5.0), 1),
                total_ratings=random.randint(10, 500),
                total_purchases=random.randint(5, 300),
                popularity_score=random.randint(50, 100),
                is_active=True, is_featured=i < 10, is_trending=i < 8,
                thumbnail_url=f"https://picsum.photos/seed/prod{i+1}/400/300",
            )
            session.add(p)
            products.append(p)
            # Product images
            for j in range(3):
                session.add(ProductImage(product_id=p.id, url=f"https://picsum.photos/seed/{p.id}-{j}/800/600", is_primary=j == 0, sort_order=j))
        session.flush()

        # Ratings & Reviews
        for p in products[:30]:
            for u in [user1, user2, user3]:
                if random.random() > 0.4:
                    r = random.randint(3, 5)
                    session.add(Rating(user_id=u.id, product_id=p.id, rating=r))
                    if random.random() > 0.6:
                        session.add(Review(user_id=u.id, product_id=p.id, title=f"Great {p.name}", content=f"Really impressed with {p.name}. Would recommend!", rating=r, is_verified_purchase=True))
        session.flush()

        # Browsing History
        for u in [user1, user2]:
            for p in random.sample(products, 10):
                session.add(BrowsingHistory(user_id=u.id, product_id=p.id, time_spent=random.randint(10, 300),
                                            viewed_at=datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 10080))))

        # Wishlists
        for u in [user1, user2, user3]:
            for p in random.sample(products, 6):
                session.add(Wishlist(user_id=u.id, product_id=p.id))
        session.flush()

        # User Interactions
        for u in [user1, user2]:
            for p in random.sample(products, 15):
                itype = random.choice(list(InteractionType))
                session.add(UserInteraction(user_id=u.id, product_id=p.id, interaction_type=itype, interaction_value=random.uniform(0.5, 5.0)))

        # Recommendations
        for u in [user1, user2, user3]:
            for p in random.sample(products, 12):
                session.add(Recommendation(
                    user_id=u.id, product_id=p.id, score=random.uniform(0.6, 0.99),
                    engine=random.choice(list(RecommendationEngine)),
                    recommendation_type=random.choice(list(RecommendationType))
                ))

        # Coupons
        coupon_data = [
            ("WELCOME10", "Welcome discount", "percentage", 10, 50, 1000),
            ("SAVE20", "Save 20% on orders", "percentage", 20, 100, 500),
            ("FLASH50", "Flash sale $50 off", "fixed", 50, 200, 200),
            ("FREESHIP", "Free shipping", "percentage", 100, 50, 300),
        ]
        for code, desc, dtype, val, min_order, limit in coupon_data:
            session.add(Coupon(code=code, description=desc, discount_type=dtype, discount_value=val,
                               min_order_value=min_order, usage_limit=limit, is_active=True,
                               expires_at=datetime.now(timezone.utc) + timedelta(days=30)))

        # Notifications
        notification_data = [
            (user1.id, "recommendation", "New Recommendations", "12 new items match your preferences", "🤖"),
            (user1.id, "price_drop", "Price Drop Alert", "Mechanical Keyboard dropped 30%", "💰"),
            (user1.id, "promotion", "Flash Sale", "Sony WH-1000XM5 is 37% off!", "🔥"),
        ]
        for uid, ntype, title, msg, icon in notification_data:
            session.add(Notification(user_id=uid, type=ntype, title=title, message=msg, icon=icon))

        # Search History
        search_queries = ["wireless earbuds", "gaming keyboard", "smartwatch", "laptop", "headphones", "4k monitor", "usb hub", "ssd"]
        for u in [user1, user2]:
            for q in random.sample(search_queries, 4):
                session.add(SearchHistory(user_id=u.id, query=q, result_count=random.randint(5, 100)))

        # AI Insights
        for u in [user1, user2, user3]:
            session.add(AIInsight(user_id=u.id, insight_type="preference_shift", title="Gaming Interest Growing",
                                  description="User is showing increased interest in gaming products",
                                  confidence=0.87, data={"category": "Gaming", "trend": "up"}))
            session.add(AIInsight(user_id=u.id, insight_type="next_purchase", title="Likely Next Purchase",
                                  description="Predicted to buy wireless earbuds within 7 days",
                                  confidence=0.76, data={"product": "Wireless Earbuds Pro", "days": 7}))

        # ── Feature Extension Seed Data ──────────────────────────

        # User Personas
        persona_data = [
            (user1.id, PersonaType.tech_enthusiast, "Tech Enthusiast", 0.92, {"avg_order_value": 450, "top_category": "Electronics", "visit_frequency": "daily"}),
            (user2.id, PersonaType.fashion_lover, "Fashion Lover", 0.87, {"avg_order_value": 180, "top_category": "Fashion", "visit_frequency": "weekly"}),
            (user3.id, PersonaType.budget_shopper, "Budget Shopper", 0.79, {"avg_order_value": 65, "top_category": "Accessories", "visit_frequency": "biweekly"}),
        ]
        for uid, ptype, label, confidence, features in persona_data:
            session.add(UserPersona(id=uuid.uuid4(), user_id=uid, persona_type=ptype, persona_label=label, confidence=confidence, features=features))
            # persona history
            for i in range(3):
                session.add(UserPersonaHistory(id=uuid.uuid4(), user_id=uid, persona_type=ptype, confidence=confidence - 0.05 * i,
                                               changed_at=datetime.now(timezone.utc) - timedelta(days=30 * (i + 1))))

        # Recommendation Explanations
        recs = session.query(Recommendation).limit(12).all()
        for r in recs:
            session.add(RecommendationExplanation(
                id=uuid.uuid4(), user_id=r.user_id, product_id=r.product_id, recommendation_id=r.id,
                reason=f"Matches your interest in {r.recommendation_type.value.replace('_', ' ').title()} products",
                reason_type=r.engine.value if hasattr(r.engine, 'value') else str(r.engine),
                confidence=r.score, feature_importance={"price": 0.3, "category": 0.5, "brand": 0.2},
                engine_contribution={"svd": 0.4, "deep_learning": 0.4, "content_based": 0.2},
            ))

        # Loyalty Points
        loyalty_sources = [("purchase", "Order completed"), ("review", "Product review bonus"), ("referral", "Friend referral bonus"), ("daily_reward", "Daily reward claim")]
        for u in [user1, user2, user3]:
            for i in range(5):
                src, desc = random.choice(loyalty_sources)
                session.add(LoyaltyPoint(id=uuid.uuid4(), user_id=u.id, points=random.randint(10, 200),
                                         source=src, description=desc,
                                         created_at=datetime.now(timezone.utc) - timedelta(days=i * 7)))

        # Daily Rewards
        reward_types = [("points", 50), ("points", 100), ("coupon", 20), ("points", 150), ("badge", 1), ("points", 200), ("coupon", 30)]
        for u in [user1, user2]:
            for day, (rtype, rval) in enumerate(reward_types, 1):
                claimed = day <= 4
                session.add(DailyReward(id=uuid.uuid4(), user_id=u.id, day_sequence=day, reward_type=rtype,
                                        reward_value=rval, claimed=claimed,
                                        claimed_at=datetime.now(timezone.utc) - timedelta(days=7 - day) if claimed else None))

        # User Streaks
        streak_data = [
            (user1.id, 7, 15, "shopping"),
            (user2.id, 3, 8, "shopping"),
            (user3.id, 1, 5, "shopping"),
        ]
        for uid, current, longest, stype in streak_data:
            session.add(UserStreak(id=uuid.uuid4(), user_id=uid, current_streak=current, longest_streak=longest,
                                   last_activity_date=datetime.now(timezone.utc) - timedelta(hours=2),
                                   streak_type=stype))

        # Referrals
        session.add(Referral(id=uuid.uuid4(), referrer_id=user1.id, referred_email="jane@example.com",
                              referred_id=user2.id, referral_code="ALEXJOIN", status="completed",
                              reward_points=500, reward_claimed=True,
                              created_at=datetime.now(timezone.utc) - timedelta(days=30),
                              completed_at=datetime.now(timezone.utc) - timedelta(days=28)))
        session.add(Referral(id=uuid.uuid4(), referrer_id=user1.id, referred_email="bob@example.com",
                              referral_code="ALEXJOIN2", status="pending", reward_points=500,
                              created_at=datetime.now(timezone.utc) - timedelta(days=2)))

        # Audit Logs
        actions = [("user.login", "session"), ("product.view", "product"), ("order.create", "order"), ("profile.update", "profile")]
        for u in [user1, user2]:
            for action, entity in actions:
                session.add(AuditLog(id=uuid.uuid4(), user_id=u.id, action=action, entity_type=entity,
                                     entity_id=str(uuid.uuid4()), old_value=None, new_value={"status": "success"},
                                     ip_address="192.168.1.100", created_at=datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48))))

        # Feature Flags
        feature_flags = [
            ("ai_recommendations", "Enable AI-powered recommendations", True, ["customer", "admin", "super_admin"]),
            ("smart_coupons", "Enable smart coupon suggestions", True, ["customer"]),
            ("gamification", "Enable gamification features", True, ["customer"]),
            ("community_features", "Enable community discussions", True, ["customer"]),
            ("price_alerts", "Enable price drop alerts", True, ["customer"]),
            ("ab_testing", "Enable A/B experiments", False, ["admin", "super_admin"]),
            ("voice_search", "Enable voice search", False, ["customer"]),
        ]
        for name, desc, enabled, roles in feature_flags:
            session.add(FeatureFlag(id=uuid.uuid4(), name=name, description=desc, enabled=enabled, enabled_for_roles=roles))

        # A/B Tests
        session.add(ABTest(id=uuid.uuid4(), name="checkout_layout_v1", description="Test new checkout layout vs current",
                            experiment_type="checkout", is_active=True,
                            variant_a_config={"layout": "single_column"}, variant_b_config={"layout": "two_column"},
                            variant_a_impressions=1050, variant_b_impressions=980,
                            variant_a_conversions=320, variant_b_conversions=310,
                            started_at=datetime.now(timezone.utc) - timedelta(days=14)))
        session.add(ABTest(id=uuid.uuid4(), name="recommendation_engine_v2", description="Test hybrid vs SVD-only",
                            experiment_type="recommendation", is_active=True,
                            variant_a_config={"engine": "hybrid"}, variant_b_config={"engine": "svd_only"},
                            variant_a_impressions=520, variant_b_impressions=510,
                            variant_a_conversions=180, variant_b_conversions=155,
                            started_at=datetime.now(timezone.utc) - timedelta(days=7)))

        # NPS Feedback
        nps_scores = [9, 7, 10, 6, 8]
        nps_reasons = ["Love the product recommendations!", "Good experience but shipping could be faster",
                        "Excellent personalized dashboard", "Prices are a bit high", "Great customer support"]
        for i, u in enumerate([user1, user2]):
            for j in range(2):
                idx = i * 2 + j
                if idx < len(nps_scores):
                    session.add(NPSFeedback(id=uuid.uuid4(), user_id=u.id, score=nps_scores[idx],
                                            reason=nps_reasons[idx] if idx < len(nps_reasons) else None,
                                            category="general", source="post_purchase"))

        # Price Alerts
        for p in products[:5]:
            session.add(PriceAlert(id=uuid.uuid4(), user_id=user1.id, product_id=p.id,
                                    target_price=round(p.price * 0.8, 2), current_price=p.price,
                                    is_triggered=False, notified=False))
        # Stock Alerts
        out_of_stock = [p for p in products if p.stock == 0]
        if out_of_stock:
            for p in out_of_stock[:3]:
                session.add(StockAlert(id=uuid.uuid4(), user_id=user1.id, product_id=p.id, is_available=False))

        # Product Comparisons
        for u in [user1, user2]:
            comp_products = random.sample(products, 4)
            session.add(ProductComparison(id=uuid.uuid4(), user_id=u.id,
                                           product_ids=[str(p.id) for p in comp_products]))

        # Achievement Badges
        badge_configs = [
            (user1.id, BadgeType.first_purchase, "First Purchase", "⭐", "Completed first purchase", True, 1.0, datetime.now(timezone.utc) - timedelta(days=60)),
            (user1.id, BadgeType.loyal_customer, "Loyal Customer", "💎", "Made 10+ purchases", True, 1.0, datetime.now(timezone.utc) - timedelta(days=5)),
            (user1.id, BadgeType.streak_master, "Streak Master", "🔥", "7-day shopping streak", True, 1.0, datetime.now(timezone.utc) - timedelta(days=1)),
            (user1.id, BadgeType.shopaholic, "Shopaholic", "🛍️", "20+ orders placed", False, 0.6),
            (user2.id, BadgeType.first_purchase, "First Purchase", "⭐", "Completed first purchase", True, 1.0, datetime.now(timezone.utc) - timedelta(days=30)),
            (user2.id, BadgeType.trend_explorer, "Trend Explorer", "🔍", "Explored 5+ categories", True, 1.0, datetime.now(timezone.utc) - timedelta(days=10)),
            (user2.id, BadgeType.deal_hunter, "Deal Hunter", "🏷️", "Used 3+ coupons", False, 0.3),
            (user3.id, BadgeType.first_purchase, "First Purchase", "⭐", "Completed first purchase", True, 1.0, datetime.now(timezone.utc) - timedelta(days=15)),
        ]
        for badge in badge_configs:
            uid, btype, label, icon, desc, earned, progress = badge[0], badge[1], badge[2], badge[3], badge[4], badge[5], badge[6]
            earned_at = badge[7] if len(badge) > 7 else None
            session.add(AchievementBadge(id=uuid.uuid4(), user_id=uid, badge_type=btype, badge_label=label,
                                          badge_icon=icon, description=desc, earned=earned, progress=progress, earned_at=earned_at))

        # User Followers
        session.add(UserFollower(id=uuid.uuid4(), follower_id=user2.id, following_id=user1.id))
        session.add(UserFollower(id=uuid.uuid4(), follower_id=user3.id, following_id=user1.id))
        session.add(UserFollower(id=uuid.uuid4(), follower_id=user1.id, following_id=user2.id))

        # Community Recommendations
        for p in products[:5]:
            rec_texts = ["Absolutely love this product!", "Great value for money", "Would buy again",
                         "Perfect for daily use", "Highly recommended!"]
            session.add(CommunityRecommendation(id=uuid.uuid4(), user_id=user1.id, product_id=p.id,
                                                 recommendation_text=random.choice(rec_texts),
                                                 likes_count=random.randint(5, 50)))

        # Orders (must be created before Smart Returns)
        for i, u in enumerate([user1, user2, user3]):
            order = Order(
                id=uuid.uuid4(), user_id=u.id,
                order_number=f"ORD-{1000 + i}",
                subtotal=round(random.uniform(500, 5000), 2),
                tax=round(random.uniform(40, 400), 2),
                shipping_cost=random.choice([0, 49, 99]),
                discount=round(random.uniform(0, 500), 2),
                total=0, status="delivered",
                payment_status="completed",
                shipping_address=f"{u.full_name}, 123 Main Street, City, 100001",
                tracking_number=f"TRACK{random.randint(10000, 99999)}",
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 60))
            )
            # Calculate total
            order.total = round(order.subtotal + order.tax + order.shipping_cost - order.discount, 2)
            session.add(order)

            # Add order items
            order_products = random.sample(products, min(3, len(products)))
            for j, p in enumerate(order_products):
                qty = random.randint(1, 3)
                session.add(OrderItem(
                    id=uuid.uuid4(), order_id=order.id, product_id=p.id,
                    quantity=qty, price=p.price, total_price=round(p.price * qty, 2)
                ))

                # Create order timeline entries
                for idx, (status_enum, status_label) in enumerate([
                    (OrderStatus.PENDING, "Order Placed"),
                    (OrderStatus.CONFIRMED, "Order Confirmed"),
                    (OrderStatus.PROCESSING, "Processing"),
                    (OrderStatus.SHIPPED, "Shipped"),
                    (OrderStatus.DELIVERED, "Delivered"),
                ]):
                    session.add(OrderTimeline(
                        id=uuid.uuid4(), order_id=order.id,
                        status=status_enum, note=status_label,
                        created_at=order.created_at + timedelta(hours=idx * 24)
                    ))

        # Smart Returns
        orders_list = session.query(Order).limit(3).all()
        for o in orders_list:
            order_items = session.query(OrderItem).filter(OrderItem.order_id == o.id).all()
            if order_items:
                item = random.choice(order_items)
                session.add(SmartReturn(id=uuid.uuid4(), user_id=o.user_id, order_id=o.id, product_id=item.product_id,
                                        reason="Product not as described", status="pending",
                                        refund_amount=item.price * item.quantity, refund_status="pending"))

        # Support Tickets
        ticket_subjects = [
            (user1.id, "Shipping delay inquiry", "My order hasn't arrived yet. Can you check the status?", "open", "high"),
            (user2.id, "Payment issue", "I was charged twice for my last order", "in_progress", "urgent"),
            (user3.id, "Product defect", "The item I received is damaged", "open", "normal"),
        ]
        for uid, subject, msg, status, priority in ticket_subjects:
            session.add(SupportTicket(id=uuid.uuid4(), user_id=uid, subject=subject, message=msg,
                                      status=status, priority=priority, assigned_to=admin.id))

        # Feedback
        for u in [user1, user2]:
            session.add(Feedback(id=uuid.uuid4(), user_id=u.id, rating=random.randint(4, 5),
                                 satisfaction_score=random.randint(7, 10), suggestion="Great platform!",
                                 category="general"))

        # Theme Preferences
        for u, theme in [(user1, ThemeType.dark), (user2, ThemeType.light), (user3, ThemeType.cyberpunk)]:
            session.add(ThemePreference(id=uuid.uuid4(), user_id=u.id, theme=theme, accent_color="#6C63FF",
                                        font_size="medium", reduced_motion=False, high_contrast=False))

        # Dashboard Layouts
        for u in [user1, user2, user3]:
            session.add(DashboardLayout(id=uuid.uuid4(), user_id=u.id,
                                         layout_config={"columns": 3, "compact": False},
                                         pinned_sections=["recommendations", "deals", "gamification"],
                                         hidden_sections=[], widget_order=["overview", "recommended", "deals", "gamification", "community", "insights", "xai", "settings"]))

        # Onboarding Progress
        session.add(OnboardingProgress(id=uuid.uuid4(), user_id=user1.id, completed_steps=["welcome", "profile", "preferences", "explore"],
                                        current_step=4, skipped=False, completed=True,
                                        completed_at=datetime.now(timezone.utc) - timedelta(days=30)))
        session.add(OnboardingProgress(id=uuid.uuid4(), user_id=user2.id, completed_steps=["welcome", "profile"],
                                        current_step=2, skipped=False, completed=False))
        session.add(OnboardingProgress(id=uuid.uuid4(), user_id=user3.id, completed_steps=["welcome"],
                                        current_step=1, skipped=False, completed=False))

        # Product Shares
        for p in products[:4]:
            session.add(ProductShare(id=uuid.uuid4(), user_id=user1.id, product_id=p.id,
                                      platform=random.choice(["twitter", "facebook", "whatsapp", "pinterest"]),
                                      share_url=f"https://cognicart.ai/products/{p.id}"))

        # Wishlist Shares
        session.add(WishlistShare(id=uuid.uuid4(), user_id=user1.id, share_code="ALEXWISH", is_public=True, views_count=23))
        session.add(WishlistShare(id=uuid.uuid4(), user_id=user2.id, share_code="SARAHWISH", is_public=False, views_count=5))

        # Smart Coupon Recommendations
        coupons_list = session.query(Coupon).all()
        for c in coupons_list[:2]:
            session.add(SmartCouponRecommendation(id=uuid.uuid4(), user_id=user1.id, coupon_id=c.id,
                                                   savings_amount=random.uniform(10, 50),
                                                   reason="Based on your shopping cart value", applied=False))

        # User Spending Analysis
        spending_data = [
            (user1.id, {"Jan": 1200, "Feb": 1500, "Mar": 1800, "Apr": 2100, "May": 1950, "Jun": 2400},
             {"Electronics": 3500, "Gaming": 2800, "Accessories": 900}, 185.50, 320.75, "increasing"),
            (user2.id, {"Jan": 600, "Feb": 750, "Mar": 820, "Apr": 700, "May": 950, "Jun": 880},
             {"Fashion": 2400, "Accessories": 600, "Smart Devices": 300}, 78.25, 150.00, "stable"),
            (user3.id, {"Jan": 200, "Feb": 180, "Mar": 250, "Apr": 300, "May": 220, "Jun": 280},
             {"Accessories": 500, "Electronics": 400, "Gaming": 200}, 35.00, 45.50, "stable"),
        ]
        for uid, monthly, cat_spending, aov, savings, trend in spending_data:
            session.add(UserSpendingAnalysis(id=uuid.uuid4(), user_id=uid, monthly_spending=monthly,
                                              category_spending=cat_spending, average_order_value=aov,
                                              total_savings=savings, spending_trend=trend))

        # Product Trend Analysis
        for p in products[:10]:
            session.add(ProductTrendAnalysis(id=uuid.uuid4(), product_id=p.id, trend_score=random.uniform(0.3, 0.95),
                                              trend_direction=random.choice(["rising", "stable", "declining"]),
                                              predicted_popularity=random.uniform(40, 100)))

        # Customer Lifetime Value
        clv_data = [
            (user1.id, 4200, 0.85, 0.92, 5800, "high_value"),
            (user2.id, 1800, 0.72, 0.78, 2500, "growth_potential"),
            (user3.id, 450, 0.55, 0.45, 800, "new"),
        ]
        for uid, clv, retention, engagement, predicted, segment in clv_data:
            session.add(CustomerLifetimeValue(id=uuid.uuid4(), user_id=uid, clv_score=clv,
                                               retention_score=retention, engagement_score=engagement,
                                               predicted_clv=predicted, segment=segment))

        # Notification Schedules
        notif_types = ["price_drop", "back_in_stock", "recommendation", "flash_sale", "loyalty_reward", "achievement", "daily_reward"]
        for u in [user1, user2, user3]:
            for nt in notif_types:
                session.add(NotificationSchedule(id=uuid.uuid4(), user_id=u.id,
                                                  notification_type=NotificationType(nt),
                                                  channel="in_app", enabled=True, frequency="instant"))

        session.commit()
        print(f"[OK] Seed data inserted: {len(users)} users, {len(categories)} categories, {len(products)} products")
        print(f"  - Ratings, reviews, browsing history, wishlists, interactions")
        print(f"  - Recommendations, coupons, notifications, search history, AI insights")
        print(f"  - Feature extensions: personas, loyalty, streaks, referrals, badges, achievements")
        print(f"  - Price alerts, stock alerts, comparisons, community, returns, tickets")


users = []


def seed():
    seed_database()


if __name__ == "__main__":
    seed()
