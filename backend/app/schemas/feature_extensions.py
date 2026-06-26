from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID
from pydantic import BaseModel, Field


class PersonaResponse(BaseModel):
    persona_type: str
    persona_label: str
    confidence: float
    features: dict = {}
    last_updated: datetime

    class Config:
        from_attributes = True


class PersonaHistoryResponse(BaseModel):
    persona_type: str
    confidence: float
    changed_at: datetime

    class Config:
        from_attributes = True


class RecommendationExplanationResponse(BaseModel):
    id: UUID
    product_id: UUID
    reason: str
    reason_type: str
    confidence: float
    feature_importance: dict = {}
    engine_contribution: dict = {}

    class Config:
        from_attributes = True


class RecommendationExplanationDetail(BaseModel):
    reasons: List[RecommendationExplanationResponse]
    confidence_overall: float
    top_features: List[dict] = []
    engine_breakdown: dict = {}


class LoyaltyPointResponse(BaseModel):
    id: UUID
    points: int
    source: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LoyaltySummaryResponse(BaseModel):
    total_points: int
    tier: str
    points_to_next_tier: int
    tier_progress: float
    recent_points: List[LoyaltyPointResponse] = []


class DailyRewardResponse(BaseModel):
    day_sequence: int
    reward_type: str
    reward_value: int
    claimed: bool
    claimed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DailyRewardClaimResponse(BaseModel):
    claimed: bool
    reward_type: str
    reward_value: int
    current_streak: int
    message: str


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    streak_type: str
    last_activity_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReferralCreate(BaseModel):
    referred_email: str


class ReferralResponse(BaseModel):
    id: UUID
    referral_code: str
    status: str
    reward_points: int
    reward_claimed: bool
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReferralStatsResponse(BaseModel):
    total_referrals: int
    successful_referrals: int
    pending_referrals: int
    total_rewards_earned: int
    referral_link: str


class AuditLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    action: str
    entity_type: str
    entity_id: Optional[UUID] = None
    old_value: Optional[dict] = None
    new_value: Optional[dict] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    items: List[AuditLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class FeatureFlagCreate(BaseModel):
    name: str
    description: Optional[str] = None
    enabled: bool = False
    enabled_for_roles: list = []
    enabled_for_users: list = []


class FeatureFlagResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    enabled: bool
    enabled_for_roles: list = []
    enabled_for_users: list = []
    created_at: datetime

    class Config:
        from_attributes = True


class FeatureFlagUpdate(BaseModel):
    enabled: Optional[bool] = None
    enabled_for_roles: Optional[list] = None
    enabled_for_users: Optional[list] = None


class ABTestResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    experiment_type: str
    is_active: bool
    variant_a_impressions: int
    variant_b_impressions: int
    variant_a_conversions: int
    variant_b_conversions: int
    variant_a_config: dict = {}
    variant_b_config: dict = {}
    started_at: datetime
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ABTestCreate(BaseModel):
    name: str
    description: Optional[str] = None
    experiment_type: str
    variant_a_config: dict = {}
    variant_b_config: dict = {}


class NPSFeedbackCreate(BaseModel):
    score: int = Field(ge=0, le=10)
    reason: Optional[str] = None
    category: Optional[str] = None


class NPSFeedbackResponse(BaseModel):
    id: str
    score: int
    reason: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NPSAnalyticsResponse(BaseModel):
    average_score: float
    total_responses: int
    promoters: int
    passives: int
    detractors: int
    nps_score: float


class PriceAlertCreate(BaseModel):
    product_id: str
    target_price: float


class PriceAlertResponse(BaseModel):
    id: str
    product_id: str
    target_price: float
    current_price: Optional[float] = None
    is_triggered: bool
    created_at: datetime

    class Config:
        from_attributes = True


class StockAlertCreate(BaseModel):
    product_id: str


class StockAlertResponse(BaseModel):
    id: str
    product_id: str
    is_available: bool
    notified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProductComparisonCreate(BaseModel):
    product_ids: List[str]


class ProductComparisonResponse(BaseModel):
    id: str
    product_ids: List[str]
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageCreate(BaseModel):
    session_id: str
    content: str


class ChatSessionResponse(BaseModel):
    session_id: str
    messages: List[ChatHistoryResponse]


class AchievementBadgeResponse(BaseModel):
    id: UUID
    badge_type: str
    badge_label: str
    badge_icon: str
    description: Optional[str] = None
    earned: bool
    progress: float
    earned_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserFollowerResponse(BaseModel):
    id: str
    follower_id: str
    following_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfilePublic(BaseModel):
    id: str
    full_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    tier: str
    total_orders: int
    total_spent: float

    class Config:
        from_attributes = True


class CommunityRecommendationCreate(BaseModel):
    product_id: str
    recommendation_text: Optional[str] = None


class CommunityRecommendationResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    product_id: str
    product_name: Optional[str] = None
    recommendation_text: Optional[str] = None
    likes_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class SmartReturnCreate(BaseModel):
    order_id: str
    product_id: str
    reason: str


class SmartReturnResponse(BaseModel):
    id: str
    order_id: str
    product_id: str
    reason: str
    status: str
    refund_amount: Optional[float] = None
    refund_status: str
    tracking_number: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SupportTicketCreate(BaseModel):
    subject: str
    message: str
    priority: str = "normal"


class SupportTicketResponse(BaseModel):
    id: str
    subject: str
    message: str
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FeedbackCreate(BaseModel):
    order_id: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    satisfaction_score: Optional[int] = Field(None, ge=1, le=10)
    suggestion: Optional[str] = None
    category: Optional[str] = None


class ThemePreferenceUpdate(BaseModel):
    theme: Optional[str] = None
    accent_color: Optional[str] = None
    font_size: Optional[str] = None
    reduced_motion: Optional[bool] = None
    high_contrast: Optional[bool] = None
    custom_css: Optional[str] = None


class ThemePreferenceResponse(BaseModel):
    theme: str
    accent_color: str
    font_size: str
    reduced_motion: bool
    high_contrast: bool

    class Config:
        from_attributes = True


class DashboardLayoutUpdate(BaseModel):
    layout_config: Optional[dict] = None
    pinned_sections: Optional[list] = None
    hidden_sections: Optional[dict] = None
    widget_order: Optional[list] = None


class DashboardLayoutResponse(BaseModel):
    layout_config: dict = {}
    pinned_sections: list = []
    hidden_sections: list = []
    widget_order: list = []

    class Config:
        from_attributes = True


class OnboardingProgressResponse(BaseModel):
    completed_steps: list = []
    current_step: int = 0
    skipped: bool = False
    completed: bool = False

    class Config:
        from_attributes = True


class ProductShareCreate(BaseModel):
    product_id: str
    platform: str


class ProductShareResponse(BaseModel):
    platform: str
    share_url: str
    created_at: datetime

    class Config:
        from_attributes = True


class WishlistShareResponse(BaseModel):
    share_code: str
    is_public: bool
    views_count: int
    share_url: str

    class Config:
        from_attributes = True


class UserSpendingResponse(BaseModel):
    monthly_spending: dict = {}
    category_spending: dict = {}
    average_order_value: float = 0.0
    total_savings: float = 0.0
    spending_trend: str = "stable"

    class Config:
        from_attributes = True


class CustomerLifetimeValueResponse(BaseModel):
    clv_score: float
    retention_score: float
    engagement_score: float
    predicted_clv: float
    segment: str

    class Config:
        from_attributes = True


class ProductTrendResponse(BaseModel):
    product_id: UUID
    product_name: str
    trend_score: float
    trend_direction: str
    predicted_popularity: float

    class Config:
        from_attributes = True


class TrendAnalysisResponse(BaseModel):
    trending_products: List[ProductTrendResponse]
    trending_categories: List[dict]


class SmartCouponResponse(BaseModel):
    coupon_id: str
    code: str
    discount_type: str
    discount_value: float
    savings_amount: float
    reason: str

    class Config:
        from_attributes = True


class NotificationScheduleUpdate(BaseModel):
    notification_type: str
    channel: str = "in_app"
    enabled: bool = True
    frequency: str = "instant"


class NotificationScheduleResponse(BaseModel):
    notification_type: str
    channel: str
    enabled: bool
    frequency: str

    class Config:
        from_attributes = True


class NotificationSendRequest(BaseModel):
    user_id: str
    notification_type: str
    title: str
    message: str
    icon: Optional[str] = None
    link: Optional[str] = None
    channels: List[str] = ["in_app"]


class ABTestRecordConversion(BaseModel):
    test_id: str
    variant: str


class ImageSearchResponse(BaseModel):
    query_image_url: str
    results: List[dict]


class SemanticSearchResponse(BaseModel):
    query: str
    results: List[dict]
    total: int


# ─── AI FEATURES ─────────────────────────────────────

class ShoppingDNAResponse(BaseModel):
    persona_type: str = "window_shopper"
    persona_label: str = "Window Shopper"
    confidence: float = 0.0
    preferred_brands: list = []
    preferred_categories: list = []
    average_monthly_spend: float = 0.0
    shopping_pattern: str = "casual"
    style_preferences: dict = {}
    price_sensitivity: str = "medium"
    brand_loyalty_score: float = 0.0
    category_affinity_scores: dict = {}
    purchase_frequency: str = "monthly"
    average_cart_value: float = 0.0
    favorite_features: list = []
    features: dict = {}
    last_analyzed: Optional[datetime] = None

    class Config:
        from_attributes = True


class AITaskCreate(BaseModel):
    task_type: str
    title: str
    description: Optional[str] = None
    params: dict = {}
    scheduled_at: Optional[datetime] = None


class AITaskUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[int] = None
    result: Optional[dict] = None


class AITaskResponse(BaseModel):
    id: str
    task_type: str
    title: str
    description: Optional[str] = None
    status: str
    params: dict = {}
    result: dict = {}
    progress: int = 0
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TrackedProductCreate(BaseModel):
    product_id: str
    target_price: Optional[float] = None
    price_drop_threshold: Optional[float] = None
    notify_on_price_drop: bool = True
    notify_on_stock: bool = False
    auto_buy_enabled: bool = False
    auto_buy_max_price: Optional[float] = None
    notes: Optional[str] = None


class TrackedProductResponse(BaseModel):
    id: str
    product_id: str
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    current_price: Optional[float] = None
    target_price: Optional[float] = None
    price_drop_threshold: Optional[float] = None
    notify_on_price_drop: bool = True
    notify_on_stock: bool = False
    auto_buy_enabled: bool = False
    auto_buy_max_price: Optional[float] = None
    is_active: bool = True
    last_checked_price: Optional[float] = None
    lowest_price_seen: Optional[float] = None
    highest_price_seen: Optional[float] = None
    price_history: list = []
    created_at: datetime

    class Config:
        from_attributes = True


class AutoBuyRuleCreate(BaseModel):
    name: str
    product_id: Optional[str] = None
    category_id: Optional[str] = None
    condition_type: str
    condition_value: float = 0.0
    max_price: Optional[float] = None
    quantity: int = 1
    payment_method: Optional[str] = None
    shipping_address_id: Optional[str] = None


class AutoBuyRuleResponse(BaseModel):
    id: str
    name: str
    product_id: Optional[str] = None
    category_id: Optional[str] = None
    condition_type: str
    condition_value: float
    max_price: Optional[float] = None
    quantity: int = 1
    payment_method: Optional[str] = None
    shipping_address_id: Optional[str] = None
    is_active: bool
    last_triggered_at: Optional[datetime] = None
    total_executions: int
    created_at: datetime

    class Config:
        from_attributes = True


class PricePredictionResponse(BaseModel):
    id: str
    product_id: str
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    current_price: float
    predicted_price: float
    predicted_price_range_min: Optional[float] = None
    predicted_price_range_max: Optional[float] = None
    expected_drop_amount: float = 0.0
    expected_drop_percentage: float = 0.0
    confidence: float = 0.0
    predicted_drop_date: Optional[datetime] = None
    prediction_horizon_days: int = 7
    factors: dict = {}
    created_at: datetime

    class Config:
        from_attributes = True


class GiftRecommendationRequest(BaseModel):
    recipient_name: Optional[str] = None
    recipient_age_group: Optional[str] = None
    relationship: Optional[str] = None
    occasion: str
    budget: float = 0.0
    interests: list = []
    personality_type: Optional[str] = None


class GiftRecommendationResponse(BaseModel):
    id: str
    recipient_name: Optional[str] = None
    occasion: str
    budget: float = 0.0
    recommended_products: list = []
    bundle_products: list = []
    total_bundle_price: Optional[float] = None
    reasoning: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReorderPredictionResponse(BaseModel):
    id: str
    product_id: str
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    predicted_next_order_date: Optional[datetime] = None
    confidence: float = 0.0
    frequency_days: Optional[int] = None
    times_purchased: int = 1
    last_purchased: Optional[datetime] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class XPLevelResponse(BaseModel):
    current_xp: int = 0
    total_xp_earned: int = 0
    level: int = 1
    xp_to_next_level: int = 100
    level_title: str = "Newbie"

    class Config:
        from_attributes = True


class AchievementResponse(BaseModel):
    id: str
    achievement_key: str
    title: str
    description: Optional[str] = None
    category: str = "shopping"
    icon: str = "trophy"
    xp_reward: int = 0
    progress_current: int = 0
    progress_target: int = 1
    is_earned: bool = False
    earned_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserPreferenceUpdate(BaseModel):
    storefront_theme: Optional[str] = None
    preferred_categories: Optional[list] = None
    excluded_categories: Optional[list] = None
    price_range_min: Optional[float] = None
    price_range_max: Optional[float] = None
    preferred_brands: Optional[list] = None
    excluded_brands: Optional[list] = None
    size_preferences: Optional[list] = None
    color_preferences: Optional[list] = None
    notify_deals: Optional[bool] = None
    notify_price_drops: Optional[bool] = None
    notify_new_arrivals: Optional[bool] = None
    notify_reorder: Optional[bool] = None
    language: Optional[str] = None


class UserPreferenceResponse(BaseModel):
    storefront_theme: str = "auto"
    homepage_layout: str = "default"
    preferred_categories: list = []
    excluded_categories: list = []
    price_range_min: Optional[float] = None
    price_range_max: Optional[float] = None
    preferred_brands: list = []
    excluded_brands: list = []
    notify_deals: bool = True
    notify_price_drops: bool = True
    notify_new_arrivals: bool = False
    notify_reorder: bool = True
    language: str = "en"

    class Config:
        from_attributes = True


class ConciergeMessageResponse(BaseModel):
    id: UUID
    type: str
    title: str
    message: str
    priority: str = "normal"
    action_url: Optional[str] = None
    action_label: Optional[str] = None
    product_id: Optional[UUID] = None
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    created_at: datetime
    is_read: bool = False


class DynamicHomepageResponse(BaseModel):
    greeting: str = "Welcome"
    time_based_banner: Optional[str] = None
    seasonal_banner: Optional[str] = None
    featured_categories: list = []
    hero_products: list = []
    personalized_deals: list = []
    recommended_sections: list = []
    storefront_theme: str = "default"


class ARSessionResponse(BaseModel):
    id: UUID
    product_id: Optional[UUID] = None
    session_type: str
    status: str = "active"
    image_url: Optional[str] = None
    result_image_url: Optional[str] = None
    model_data: dict = {}
    created_at: datetime

    class Config:
        from_attributes = True


class ARSessionCreate(BaseModel):
    product_id: str
    session_type: str
    image_url: Optional[str] = None
