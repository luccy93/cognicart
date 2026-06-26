import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Enum, JSON, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.uuid_type import GUID


class PersonaType(str, enum.Enum):
    budget_shopper = "budget_shopper"
    premium_shopper = "premium_shopper"
    frequent_buyer = "frequent_buyer"
    fashion_lover = "fashion_lover"
    tech_enthusiast = "tech_enthusiast"
    window_shopper = "window_shopper"


class LoyaltyTier(str, enum.Enum):
    bronze = "bronze"
    silver = "silver"
    gold = "gold"
    platinum = "platinum"
    diamond = "diamond"


class BadgeType(str, enum.Enum):
    first_purchase = "first_purchase"
    loyal_customer = "loyal_customer"
    top_reviewer = "top_reviewer"
    trend_explorer = "trend_explorer"
    early_adopter = "early_adopter"
    shopaholic = "shopaholic"
    streak_master = "streak_master"
    deal_hunter = "deal_hunter"
    social_butterfly = "social_butterfly"
    influencer = "influencer"


class ThemeType(str, enum.Enum):
    dark = "dark"
    light = "light"
    cyberpunk = "cyberpunk"
    minimal = "minimal"


class NotificationType(str, enum.Enum):
    price_drop = "price_drop"
    back_in_stock = "back_in_stock"
    recommendation = "recommendation"
    flash_sale = "flash_sale"
    loyalty_reward = "loyalty_reward"
    achievement = "achievement"
    referral = "referral"
    daily_reward = "daily_reward"
    order_update = "order_update"
    system = "system"


class UserPersona(Base):
    __tablename__ = "user_personas"

    id = Column(GUID, primary_key=True, default=lambda: str(datetime.now().timestamp()).replace('.', '') + 'p')
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, unique=True)
    persona_type = Column(Enum(PersonaType), nullable=False)
    persona_label = Column(String(50), nullable=False)
    confidence = Column(Float, default=0.0)
    features = Column(JSON, default=dict)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="persona")


class RecommendationExplanation(Base):
    __tablename__ = "recommendation_explanations"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False)
    recommendation_id = Column(GUID, ForeignKey("recommendations.id"), nullable=True)
    reason = Column(Text, nullable=False)
    reason_type = Column(String(50), nullable=False)
    confidence = Column(Float, default=0.0)
    feature_importance = Column(JSON, default=dict)
    engine_contribution = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    product = relationship("Product")
    recommendation = relationship("Recommendation")


class UserPersonaHistory(Base):
    __tablename__ = "user_persona_history"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    persona_type = Column(Enum(PersonaType), nullable=False)
    confidence = Column(Float, default=0.0)
    changed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class LoyaltyPoint(Base):
    __tablename__ = "loyalty_points"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    points = Column(Integer, default=0, nullable=False)
    source = Column(String(50), nullable=False)
    description = Column(String(255))
    reference_id = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="loyalty_point_logs")

    __table_args__ = (
        Index("ix_loyalty_points_user_created", "user_id", "created_at"),
    )


class DailyReward(Base):
    __tablename__ = "daily_rewards"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    day_sequence = Column(Integer, default=1, nullable=False)
    reward_type = Column(String(50), nullable=False)
    reward_value = Column(Integer, nullable=False)
    claimed = Column(Boolean, default=False)
    claimed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="daily_rewards")

    __table_args__ = (
        UniqueConstraint("user_id", "day_sequence", name="uq_daily_reward_user_day"),
    )


class UserStreak(Base):
    __tablename__ = "user_streaks"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, unique=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(DateTime)
    streak_type = Column(String(50), default="shopping")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="streak")


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(GUID, primary_key=True)
    referrer_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    referred_email = Column(String(255))
    referred_id = Column(GUID, ForeignKey("users.id"), nullable=True)
    referral_code = Column(String(20), unique=True, nullable=False, index=True)
    status = Column(String(20), default="pending")
    reward_points = Column(Integer, default=0)
    reward_claimed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    referrer = relationship("User", foreign_keys=[referrer_id], backref="referrals_made")
    referred = relationship("User", foreign_keys=[referred_id], backref="referrals_received")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100))
    old_value = Column(JSON)
    new_value = Column(JSON)
    ip_address = Column(String(45))
    user_agent = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", backref="audit_logs")


class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(GUID, primary_key=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(255))
    enabled = Column(Boolean, default=False)
    enabled_for_roles = Column(JSON, default=list)
    enabled_for_users = Column(JSON, default=list)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ABTest(Base):
    __tablename__ = "ab_tests"

    id = Column(GUID, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    experiment_type = Column(String(50), nullable=False)
    variant_a_config = Column(JSON, default=dict)
    variant_b_config = Column(JSON, default=dict)
    variant_a_impressions = Column(Integer, default=0)
    variant_b_impressions = Column(Integer, default=0)
    variant_a_conversions = Column(Integer, default=0)
    variant_b_conversions = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime)


class NPSFeedback(Base):
    __tablename__ = "nps_feedback"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=True)
    score = Column(Integer, nullable=False)
    reason = Column(Text)
    category = Column(String(50))
    source = Column(String(50), default="post_purchase")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="nps_feedbacks")


class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False)
    target_price = Column(Float, nullable=False)
    current_price = Column(Float)
    is_triggered = Column(Boolean, default=False)
    triggered_at = Column(DateTime)
    notified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="price_alerts")
    product = relationship("Product", backref="price_alerts")

    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_price_alert_user_product"),
    )


class StockAlert(Base):
    __tablename__ = "stock_alerts"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False)
    is_available = Column(Boolean, default=False)
    notified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    notified_at = Column(DateTime)

    user = relationship("User", backref="stock_alerts")
    product = relationship("Product", backref="stock_alerts")

    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_stock_alert_user_product"),
    )


class ProductComparison(Base):
    __tablename__ = "product_comparisons"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    product_ids = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="product_comparisons")


class ChatHistory(Base):
    __tablename__ = "chat_histories"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    session_id = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="chat_histories")

    __table_args__ = (
        Index("ix_chat_history_session", "user_id", "session_id"),
    )


class AchievementBadge(Base):
    __tablename__ = "achievement_badges"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    badge_type = Column(Enum(BadgeType), nullable=False)
    badge_label = Column(String(50), nullable=False)
    badge_icon = Column(String(10), default="🏆")
    description = Column(String(255))
    earned = Column(Boolean, default=False)
    progress = Column(Float, default=0.0)
    earned_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="achievement_badges")

    __table_args__ = (
        UniqueConstraint("user_id", "badge_type", name="uq_achievement_user_badge"),
    )


class UserFollower(Base):
    __tablename__ = "user_followers"

    id = Column(GUID, primary_key=True)
    follower_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    following_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    follower = relationship("User", foreign_keys=[follower_id], backref="following")
    following = relationship("User", foreign_keys=[following_id], backref="followers")

    __table_args__ = (
        UniqueConstraint("follower_id", "following_id", name="uq_follower_following"),
    )


class CommunityRecommendation(Base):
    __tablename__ = "community_recommendations"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False)
    recommendation_text = Column(Text)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="community_recommendations")
    product = relationship("Product", backref="community_recommendations")


class SmartReturn(Base):
    __tablename__ = "smart_returns"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    order_id = Column(GUID, ForeignKey("orders.id"), nullable=False)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="pending")
    refund_amount = Column(Float)
    refund_status = Column(String(20), default="pending")
    tracking_number = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="returns")
    order = relationship("Order", backref="returns")
    product = relationship("Product", backref="returns")


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="open")
    priority = Column(String(20), default="normal")
    assigned_to = Column(GUID, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id], backref="tickets")
    assignee = relationship("User", foreign_keys=[assigned_to], backref="assigned_tickets")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=True)
    order_id = Column(GUID, ForeignKey("orders.id"), nullable=True)
    rating = Column(Integer, nullable=False)
    satisfaction_score = Column(Integer)
    suggestion = Column(Text)
    category = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)


class ThemePreference(Base):
    __tablename__ = "theme_preferences"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, unique=True)
    theme = Column(Enum(ThemeType), default=ThemeType.dark)
    accent_color = Column(String(7), default="#6C63FF")
    font_size = Column(String(10), default="medium")
    reduced_motion = Column(Boolean, default=False)
    high_contrast = Column(Boolean, default=False)
    custom_css = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="theme_preference")


class DashboardLayout(Base):
    __tablename__ = "dashboard_layouts"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, unique=True)
    layout_config = Column(JSON, default=dict)
    pinned_sections = Column(JSON, default=list)
    hidden_sections = Column(JSON, default=list)
    widget_order = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="dashboard_layout")


class OnboardingProgress(Base):
    __tablename__ = "onboarding_progress"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, unique=True)
    completed_steps = Column(JSON, default=list)
    current_step = Column(Integer, default=0)
    skipped = Column(Boolean, default=False)
    completed = Column(Boolean, default=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)


class ProductShare(Base):
    __tablename__ = "product_shares"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False)
    platform = Column(String(50), nullable=False)
    share_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    product = relationship("Product")


class WishlistShare(Base):
    __tablename__ = "wishlist_shares"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    share_code = Column(String(20), unique=True, nullable=False, index=True)
    is_public = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class ImageSearchResult(Base):
    __tablename__ = "image_search_results"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=True)
    query_image_url = Column(String(500))
    result_product_ids = Column(JSON, default=list)
    search_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


class SemanticSearchLog(Base):
    __tablename__ = "semantic_search_logs"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=True)
    query_text = Column(Text, nullable=False)
    processed_query = Column(Text)
    result_count = Column(Integer, default=0)
    search_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


class SmartCouponRecommendation(Base):
    __tablename__ = "smart_coupon_recommendations"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    coupon_id = Column(GUID, ForeignKey("coupons.id"), nullable=False)
    savings_amount = Column(Float, default=0.0)
    reason = Column(String(255))
    applied = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    coupon = relationship("Coupon")


class UserSpendingAnalysis(Base):
    __tablename__ = "user_spending_analyses"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, unique=True)
    monthly_spending = Column(JSON, default=dict)
    category_spending = Column(JSON, default=dict)
    average_order_value = Column(Float, default=0.0)
    total_savings = Column(Float, default=0.0)
    spending_trend = Column(String(20), default="stable")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")


class ProductTrendAnalysis(Base):
    __tablename__ = "product_trend_analyses"

    id = Column(GUID, primary_key=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False, unique=True)
    trend_score = Column(Float, default=0.0)
    trend_direction = Column(String(20), default="stable")
    predicted_popularity = Column(Float, default=0.0)
    analysis_date = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product")


class CustomerLifetimeValue(Base):
    __tablename__ = "customer_lifetime_values"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, unique=True)
    clv_score = Column(Float, default=0.0)
    retention_score = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    predicted_clv = Column(Float, default=0.0)
    segment = Column(String(50), default="unknown")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")


class NotificationSchedule(Base):
    __tablename__ = "notification_schedules"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    channel = Column(String(20), default="in_app")
    enabled = Column(Boolean, default=True)
    frequency = Column(String(20), default="instant")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="notification_schedules")

    __table_args__ = (
        UniqueConstraint("user_id", "notification_type", "channel", name="uq_notification_schedule"),
    )


class ShoppingDNA(Base):
    __tablename__ = "shopping_dna"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, unique=True)
    persona_type = Column(String(50), default="window_shopper")
    persona_label = Column(String(100), default="Window Shopper")
    confidence = Column(Float, default=0.0)
    preferred_brands = Column(JSON, default=list)
    preferred_categories = Column(JSON, default=list)
    average_monthly_spend = Column(Float, default=0.0)
    shopping_pattern = Column(String(50), default="casual")
    style_preferences = Column(JSON, default=dict)
    price_sensitivity = Column(String(20), default="medium")
    brand_loyalty_score = Column(Float, default=0.0)
    category_affinity_scores = Column(JSON, default=dict)
    purchase_frequency = Column(String(20), default="monthly")
    average_cart_value = Column(Float, default=0.0)
    favorite_features = Column(JSON, default=list)
    features = Column(JSON, default=dict)
    last_analyzed = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="shopping_dna")


class AITask(Base):
    __tablename__ = "ai_tasks"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    task_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(20), default="active")
    params = Column(JSON, default=dict)
    result = Column(JSON, default=dict)
    progress = Column(Integer, default=0)
    scheduled_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="ai_tasks")

    __table_args__ = (Index("ix_ai_tasks_user_status", "user_id", "status"),)


class TrackedProduct(Base):
    __tablename__ = "tracked_products"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False)
    target_price = Column(Float)
    price_drop_threshold = Column(Float)
    notify_on_price_drop = Column(Boolean, default=True)
    notify_on_stock = Column(Boolean, default=False)
    auto_buy_enabled = Column(Boolean, default=False)
    auto_buy_max_price = Column(Float)
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    last_checked_price = Column(Float)
    lowest_price_seen = Column(Float)
    highest_price_seen = Column(Float)
    price_history = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="tracked_products")
    product = relationship("Product", backref="tracked_products")

    __table_args__ = (UniqueConstraint("user_id", "product_id", name="uq_tracked_product_user"),)


class AutoBuyRule(Base):
    __tablename__ = "auto_buy_rules"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=True)
    category_id = Column(GUID, ForeignKey("categories.id"), nullable=True)
    condition_type = Column(String(50), nullable=False)
    condition_value = Column(Float)
    max_price = Column(Float)
    quantity = Column(Integer, default=1)
    payment_method = Column(String(50))
    shipping_address_id = Column(GUID, ForeignKey("addresses.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    last_triggered_at = Column(DateTime)
    total_executions = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="auto_buy_rules")
    product = relationship("Product")


class PricePrediction(Base):
    __tablename__ = "price_predictions"

    id = Column(GUID, primary_key=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False, index=True)
    current_price = Column(Float, nullable=False)
    predicted_price = Column(Float, nullable=False)
    predicted_price_range_min = Column(Float)
    predicted_price_range_max = Column(Float)
    expected_drop_amount = Column(Float, default=0.0)
    expected_drop_percentage = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    predicted_drop_date = Column(DateTime)
    prediction_horizon_days = Column(Integer, default=7)
    factors = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", backref="price_predictions")

    __table_args__ = (Index("ix_price_prediction_product", "product_id", "is_active"),)


class GiftRecommendation(Base):
    __tablename__ = "gift_recommendations"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    recipient_name = Column(String(100))
    recipient_age_group = Column(String(20))
    relationship_type = Column(String(50))
    occasion = Column(String(50), nullable=False)
    budget = Column(Float)
    interests = Column(JSON, default=list)
    gift_category = Column(String(50))
    recommended_product_ids = Column(JSON, default=list)
    reasoning = Column(Text)
    bundle_product_ids = Column(JSON, default=list)
    total_bundle_price = Column(Float)
    personality_type = Column(String(50))
    is_used = Column(Boolean, default=False)
    feedback_rating = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="gift_recommendations")

    __table_args__ = (Index("ix_gift_recommendations_user_occasion", "user_id", "occasion"),)


class ReorderPrediction(Base):
    __tablename__ = "reorder_predictions"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False)
    predicted_next_order_date = Column(DateTime)
    confidence = Column(Float, default=0.0)
    frequency_days = Column(Integer)
    times_purchased = Column(Integer, default=1)
    last_purchased = Column(DateTime)
    is_active = Column(Boolean, default=True)
    notified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="reorder_predictions")
    product = relationship("Product", backref="reorder_predictions")

    __table_args__ = (UniqueConstraint("user_id", "product_id", name="uq_reorder_prediction"),)


class XPLevel(Base):
    __tablename__ = "xp_levels"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, unique=True)
    current_xp = Column(Integer, default=0)
    total_xp_earned = Column(Integer, default=0)
    level = Column(Integer, default=1)
    xp_to_next_level = Column(Integer, default=100)
    level_title = Column(String(50), default="Newbie")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="xp_level")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    achievement_key = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(50))
    icon = Column(String(50), default="trophy")
    xp_reward = Column(Integer, default=0)
    points_reward = Column(Integer, default=0)
    progress_current = Column(Integer, default=0)
    progress_target = Column(Integer, default=1)
    is_earned = Column(Boolean, default=False)
    earned_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="achievements")

    __table_args__ = (
        UniqueConstraint("user_id", "achievement_key", name="uq_achievement_key"),
        Index("ix_achievements_user_earned", "user_id", "is_earned"),
    )


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, unique=True)
    storefront_theme = Column(String(50), default="auto")
    homepage_layout = Column(String(50), default="default")
    preferred_categories = Column(JSON, default=list)
    excluded_categories = Column(JSON, default=list)
    price_range_min = Column(Float)
    price_range_max = Column(Float)
    preferred_brands = Column(JSON, default=list)
    excluded_brands = Column(JSON, default=list)
    size_preferences = Column(JSON, default=list)
    color_preferences = Column(JSON, default=list)
    notify_deals = Column(Boolean, default=True)
    notify_price_drops = Column(Boolean, default=True)
    notify_new_arrivals = Column(Boolean, default=False)
    notify_reorder = Column(Boolean, default=True)
    dark_mode = Column(Boolean, default=True)
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="user_preferences")


class ARSession(Base):
    __tablename__ = "ar_sessions"

    id = Column(GUID, primary_key=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=True)
    session_type = Column(String(50), nullable=False)
    status = Column(String(20), default="active")
    image_url = Column(String(500))
    result_image_url = Column(String(500))
    model_data = Column(JSON, default=dict)
    duration_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="ar_sessions")
    product = relationship("Product", backref="ar_sessions")

    __table_args__ = (Index("ix_ar_sessions_user_type", "user_id", "session_type"),)
