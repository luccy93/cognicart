from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.schemas.product import ProductResponse


# ─── Marketplace ───────────────────────────────────────────────────────────────

class SellerCreate(BaseModel):
    store_name: str
    store_slug: str
    description: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    business_address: Optional[str] = None
    bank_account: Optional[str] = None
    ifsc_code: Optional[str] = None
    upi_id: Optional[str] = None


class SellerUpdate(BaseModel):
    store_name: Optional[str] = None
    store_slug: Optional[str] = None
    description: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    business_address: Optional[str] = None
    bank_account: Optional[str] = None
    ifsc_code: Optional[str] = None
    upi_id: Optional[str] = None


class SellerResponse(BaseModel):
    id: UUID
    user_id: UUID
    store_name: str
    store_slug: str
    store_logo: Optional[str]
    store_banner: Optional[str]
    description: Optional[str]
    is_verified: bool
    is_active: bool
    total_products: int
    total_revenue: float
    total_orders: int
    rating: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SellerListResponse(BaseModel):
    items: List[SellerResponse]
    total: int
    page: int
    page_size: int


class SellerPayoutResponse(BaseModel):
    id: UUID
    seller_id: UUID
    amount: float
    fee: float
    tax: float
    net_amount: float
    status: str
    payout_method: str
    reference: Optional[str]
    period_start: datetime
    period_end: datetime
    paid_at: Optional[datetime]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Inventory ─────────────────────────────────────────────────────────────────

class InventoryResponse(BaseModel):
    id: UUID
    product_id: UUID
    warehouse_id: UUID
    product_name: str
    warehouse_name: str
    quantity: int
    reserved_quantity: int
    available_quantity: int  # computed: quantity - reserved_quantity
    low_stock_threshold: int
    reorder_point: int

    model_config = ConfigDict(from_attributes=True)


class InventoryUpdate(BaseModel):
    quantity: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    reorder_point: Optional[int] = None


class InventoryTransactionResponse(BaseModel):
    id: UUID
    product_id: UUID
    warehouse_id: UUID
    type: str
    quantity: int
    reference_type: Optional[str]
    reference_id: Optional[UUID]
    notes: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Payments ──────────────────────────────────────────────────────────────────

class SavedCardResponse(BaseModel):
    id: UUID
    gateway: str
    card_last_four: str
    card_brand: str
    card_holder_name: str
    expiry_month: int
    expiry_year: int
    is_default: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RefundCreate(BaseModel):
    order_id: UUID
    amount: float
    reason: str


class RefundResponse(BaseModel):
    id: UUID
    order_id: UUID
    payment_id: UUID
    amount: float
    reason: str
    status: str
    initiated_by: UUID
    processed_at: Optional[datetime]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Checkout ──────────────────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    address_id: UUID
    payment_method: str  # stripe / razorpay / cod / upi
    coupon_code: Optional[str] = None
    save_address: Optional[bool] = None
    gift_message: Optional[str] = None
    is_gift: Optional[bool] = None


class CheckoutResponse(BaseModel):
    order_id: UUID
    order_number: str
    total: float
    payment_url: Optional[str]
    status: str


# ─── Order Lifecycle ───────────────────────────────────────────────────────────

class OrderStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None


class ReturnRequestCreate(BaseModel):
    order_item_id: UUID
    reason: str
    pickup_address: Optional[str] = None


class ReturnRequestResponse(BaseModel):
    id: UUID
    order_id: UUID
    order_item_id: UUID
    reason: str
    status: str
    pickup_address: Optional[str]
    pickup_scheduled_at: Optional[datetime]
    pickup_completed_at: Optional[datetime]
    refund_amount: Optional[float]
    refund_status: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderTimelineResponse(BaseModel):
    id: UUID
    status: str
    note: Optional[str]
    created_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CancelOrderResponse(BaseModel):
    message: str
    refund_status: str


# ─── Delivery ──────────────────────────────────────────────────────────────────

class ShipmentResponse(BaseModel):
    id: UUID
    order_id: UUID
    carrier: str
    tracking_number: str
    service_type: str
    shipped_at: Optional[datetime]
    estimated_delivery: Optional[datetime]
    delivered_at: Optional[datetime]
    status: str
    current_location: Optional[str]
    tracking_url: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class ShipmentTrackingUpdate(BaseModel):
    status: str
    date: datetime
    location: str


class ShipmentTrackingResponse(BaseModel):
    shipment_id: UUID
    carrier: str
    tracking_number: str
    status: str
    estimated_delivery: Optional[datetime]
    updates: List[ShipmentTrackingUpdate]


# ─── Reviews ───────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    product_id: UUID
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    content: str
    images: Optional[List[str]] = None


class ReviewUpdate(BaseModel):
    content: Optional[str] = None
    rating: Optional[int] = Field(default=None, ge=1, le=5)


class ReviewResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_name: str
    user_avatar: Optional[str]
    product_id: UUID
    title: Optional[str]
    content: str
    rating: int
    is_verified_purchase: bool
    helpful_count: int
    images: List[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class ReviewModeration(BaseModel):
    is_approved: bool
    moderation_note: Optional[str] = None


# ─── Flash Sales ───────────────────────────────────────────────────────────────

class FlashSaleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    banner_url: Optional[str] = None
    discount_type: str  # percentage / fixed
    discount_value: float
    starts_at: datetime
    ends_at: datetime


class FlashSaleItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str
    product_image: Optional[str]
    sale_price: float
    quantity_limit: int
    sold_count: int

    model_config = ConfigDict(from_attributes=True)


class FlashSaleResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    banner_url: Optional[str]
    discount_type: str
    discount_value: float
    starts_at: datetime
    ends_at: datetime
    is_active: bool
    items: Optional[List[FlashSaleItemResponse]]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Price Tracking ────────────────────────────────────────────────────────────

class PriceAlertCreate(BaseModel):
    product_id: UUID
    target_price: float


class PriceAlertResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str
    product_image: Optional[str]
    current_price: float
    target_price: float
    is_active: bool
    triggered: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Loyalty ───────────────────────────────────────────────────────────────────

class LoyaltyTransactionResponse(BaseModel):
    id: UUID
    points: int
    transaction_type: str  # earned / redeemed / expired / adjusted
    reference_type: Optional[str]
    reference_id: Optional[UUID]
    description: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DailyRewardResponse(BaseModel):
    reward_date: str
    points_earned: int
    streak_day: int
    claimed: bool


class DailyRewardClaimResponse(BaseModel):
    points_earned: int
    streak_day: int
    message: str


class ReferralCreate(BaseModel):
    custom_code: Optional[str] = None


class ReferralResponse(BaseModel):
    id: UUID
    code: str
    status: str  # pending / completed / expired
    reward_points: int
    referred_email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Prime Subscription ────────────────────────────────────────────────────────

class PrimeCreateCheckout(BaseModel):
    plan: str  # monthly / yearly / lifetime


class PrimeSubscriptionResponse(BaseModel):
    id: UUID
    plan: str
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    auto_renew: bool
    days_remaining: int  # computed

    model_config = ConfigDict(from_attributes=True)


class PrimeCheckoutResponse(BaseModel):
    url: str
    subscription_id: UUID


# ─── Notifications ─────────────────────────────────────────────────────────────

class NotificationResponse(BaseModel):
    id: UUID
    type: str
    title: str
    message: str
    icon: Optional[str]
    link: Optional[str]
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationSettingsUpdate(BaseModel):
    email_enabled: bool
    sms_enabled: bool
    push_enabled: bool
    categories: List[str]


class NotificationSendRequest(BaseModel):
    user_id: UUID
    type: str
    title: str
    message: str
    channels: List[str]  # email / sms / push / in-app


# ─── Community ─────────────────────────────────────────────────────────────────

class DiscussionCreate(BaseModel):
    title: str
    content: str
    product_id: Optional[UUID] = None
    tags: Optional[List[str]] = None


class DiscussionResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_name: str
    user_avatar: Optional[str]
    product_id: Optional[UUID]
    title: str
    content: str
    tags: Optional[List[str]]
    like_count: int
    reply_count: int
    is_pinned: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReplyCreate(BaseModel):
    content: str


class ReplyResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_name: str
    user_avatar: Optional[str]
    content: str
    like_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ShareRequest(BaseModel):
    product_id: UUID
    platform: str  # facebook / twitter / whatsapp / telegram / email


# ─── Support ───────────────────────────────────────────────────────────────────

class TicketCreate(BaseModel):
    subject: str
    description: str
    category: str
    priority: str  # low / medium / high / urgent


class TicketResponse(BaseModel):
    id: UUID
    subject: str
    description: str
    category: str
    priority: str
    status: str
    assigned_to: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketMessageCreate(BaseModel):
    message: str
    attachment_url: Optional[str] = None


class TicketMessageResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_name: str
    message: str
    attachment_url: Optional[str]
    is_staff: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class KnowledgeBaseResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    content: str
    category: str
    tags: Optional[List[str]]
    helpful_count: int

    model_config = ConfigDict(from_attributes=True)


# ─── Enterprise ────────────────────────────────────────────────────────────────

class AuditLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    action: str
    resource_type: str
    resource_id: str
    details: Optional[dict]
    ip_address: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FeatureFlagCreate(BaseModel):
    name: str
    description: str
    is_enabled: bool
    rollout_percentage: int = Field(default=100, ge=0, le=100)
    conditions: Optional[dict] = None


class FeatureFlagResponse(BaseModel):
    id: UUID
    name: str
    description: str
    is_enabled: bool
    rollout_percentage: int
    conditions: Optional[dict]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ABTestVariant(BaseModel):
    name: str
    weight: float = Field(..., ge=0, le=1)


class ABTestCreate(BaseModel):
    name: str
    description: str
    metric: str
    variants: List[ABTestVariant]
    weights: Optional[List[float]] = None


class ABTestResponse(BaseModel):
    id: UUID
    name: str
    description: str
    metric: str
    variants: List[ABTestVariant]
    weights: Optional[List[float]]
    status: str
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ABTestEventCreate(BaseModel):
    variant: str
    event_type: str
    event_value: Optional[float] = None


# ─── Search ────────────────────────────────────────────────────────────────────

class SearchResponse(BaseModel):
    results: List[ProductResponse]
    suggestions: List[str]
    total: int
    page: int
    page_size: int
    query: str
    filters: dict


class TrendingSearchResponse(BaseModel):
    query: str
    count: int
    trend_direction: str  # up / down / stable


class VoiceSearchResponse(BaseModel):
    transcript: str
    corrected_query: str
    results: List[ProductResponse]
