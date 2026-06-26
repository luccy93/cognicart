import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, Text, ForeignKey, Enum as SAEnum, Date, JSON, UniqueConstraint, Index, CheckConstraint
from sqlalchemy.orm import relationship
from app.models.uuid_type import GUID
import enum
from app.database import Base


class PayoutStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class PayoutMethod(str, enum.Enum):
    BANK = "bank"
    UPI = "upi"


class InventoryTransactionType(str, enum.Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"
    ADJUSTMENT = "adjustment"
    RETURN = "return"
    TRANSFER = "transfer"


class RefundStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class ReturnRequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    PICKED_UP = "picked_up"
    REFUNDED = "refunded"
    REJECTED = "rejected"


class ShipmentStatus(str, enum.Enum):
    PENDING = "pending"
    PICKED = "picked"
    IN_TRANSIT = "in_transit"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    FAILED = "failed"
    RETURNED = "returned"


class ReviewVoteType(str, enum.Enum):
    HELPFUL = "helpful"
    UNHELPFUL = "unhelpful"


class DiscountType(str, enum.Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"


class LoyaltyTransactionType(str, enum.Enum):
    EARNED = "earned"
    SPENT = "spent"
    EXPIRED = "expired"
    REFERRAL = "referral"
    CASHBACK = "cashback"


class SubscriptionPlan(str, enum.Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"
    LIFETIME = "lifetime"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class TicketPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TicketStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class ABTestStatus(str, enum.Enum):
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"


class Seller(Base):
    __tablename__ = "sellers"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    store_name = Column(String(255), nullable=False)
    store_slug = Column(String(255), unique=True, nullable=False, index=True)
    store_logo = Column(String(500), nullable=True)
    store_banner = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    gst_number = Column(String(50), nullable=True)
    pan_number = Column(String(50), nullable=True)
    business_address = Column(Text, nullable=True)
    bank_account = Column(String(100), nullable=True)
    ifsc_code = Column(String(20), nullable=True)
    upi_id = Column(String(100), nullable=True)
    commission_rate = Column(Float, default=0.0)
    total_products = Column(Integer, default=0)
    total_revenue = Column(Float, default=0.0)
    total_orders = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="seller")

    def __repr__(self):
        return f"<Seller {self.store_name}>"


class SellerPayout(Base):
    __tablename__ = "seller_payouts"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    seller_id = Column(GUID, ForeignKey("sellers.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    fee = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    net_amount = Column(Float, nullable=False)
    status = Column(SAEnum(PayoutStatus), default=PayoutStatus.PENDING, nullable=False)
    payout_method = Column(SAEnum(PayoutMethod), nullable=False)
    reference = Column(String(255), nullable=True)
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    seller = relationship("Seller", backref="payouts")

    def __repr__(self):
        return f"<SellerPayout {self.id} seller={self.seller_id} amount={self.amount}>"


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Warehouse {self.name}>"


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False, index=True)
    warehouse_id = Column(GUID, ForeignKey("warehouses.id"), nullable=False, index=True)
    quantity = Column(Integer, default=0)
    reserved_quantity = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=10)
    reorder_point = Column(Integer, default=20)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    product = relationship("Product")
    warehouse = relationship("Warehouse")

    __table_args__ = (
        UniqueConstraint("product_id", "warehouse_id", name="uq_inventory_product_warehouse"),
        CheckConstraint("quantity >= 0", name="ck_inventory_quantity"),
        CheckConstraint("reserved_quantity >= 0", name="ck_inventory_reserved"),
        Index("ix_inventory_low_stock", "product_id", "warehouse_id", "quantity"),
    )

    def __repr__(self):
        return f"<Inventory product={self.product_id} warehouse={self.warehouse_id} qty={self.quantity}>"


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False, index=True)
    warehouse_id = Column(GUID, ForeignKey("warehouses.id"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=True, index=True)
    type = Column(SAEnum(InventoryTransactionType), nullable=False)
    quantity = Column(Integer, nullable=False)
    reference_type = Column(String(50), nullable=True)
    reference_id = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    product = relationship("Product")
    warehouse = relationship("Warehouse")
    user = relationship("User")

    __table_args__ = (
        Index("ix_inventory_transactions_ref", "reference_type", "reference_id"),
    )

    def __repr__(self):
        return f"<InventoryTransaction {self.type} product={self.product_id} qty={self.quantity}>"


class SavedCard(Base):
    __tablename__ = "saved_cards"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    gateway = Column(String(50), nullable=False)
    card_last_four = Column(String(4), nullable=False)
    card_brand = Column(String(50), nullable=False)
    card_holder_name = Column(String(255), nullable=True)
    expiry_month = Column(Integer, nullable=False)
    expiry_year = Column(Integer, nullable=False)
    is_default = Column(Boolean, default=False)
    gateway_card_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="saved_cards")

    __table_args__ = (
        CheckConstraint("expiry_month >= 1 AND expiry_month <= 12", name="ck_card_expiry_month"),
        CheckConstraint("expiry_year >= 2024", name="ck_card_expiry_year"),
    )

    def __repr__(self):
        return f"<SavedCard {self.card_brand} ****{self.card_last_four}>"


class Refund(Base):
    __tablename__ = "refunds"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    order_id = Column(GUID, ForeignKey("orders.id"), nullable=False, index=True)
    payment_id = Column(GUID, ForeignKey("payments.id"), nullable=True, index=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(SAEnum(RefundStatus), default=RefundStatus.PENDING, nullable=False)
    initiated_by = Column(String(50), nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    order = relationship("Order")
    payment = relationship("Payment")
    user = relationship("User")

    def __repr__(self):
        return f"<Refund {self.id} order={self.order_id} amount={self.amount} status={self.status.value}>"


class ReturnRequest(Base):
    __tablename__ = "return_requests"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    order_id = Column(GUID, ForeignKey("orders.id"), nullable=False, index=True)
    order_item_id = Column(GUID, ForeignKey("order_items.id"), nullable=False)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    reason = Column(Text, nullable=False)
    status = Column(SAEnum(ReturnRequestStatus), default=ReturnRequestStatus.PENDING, nullable=False)
    pickup_address = Column(Text, nullable=True)
    pickup_scheduled_at = Column(DateTime(timezone=True), nullable=True)
    pickup_completed_at = Column(DateTime(timezone=True), nullable=True)
    refund_amount = Column(Float, nullable=True)
    refund_status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    order = relationship("Order")
    order_item = relationship("OrderItem")
    user = relationship("User")

    def __repr__(self):
        return f"<ReturnRequest {self.id} order={self.order_id} status={self.status.value}>"


class OrderTimeline(Base):
    __tablename__ = "order_timeline"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    order_id = Column(GUID, ForeignKey("orders.id"), nullable=False, index=True)
    status = Column(String(50), nullable=False)
    note = Column(Text, nullable=True)
    created_by = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    order = relationship("Order", backref="timeline")

    __table_args__ = (
        Index("ix_order_timeline_order_created", "order_id", "created_at"),
    )

    def __repr__(self):
        return f"<OrderTimeline order={self.order_id} status={self.status}>"


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    order_id = Column(GUID, ForeignKey("orders.id"), nullable=False, index=True)
    carrier = Column(String(50), nullable=False)
    tracking_number = Column(String(255), nullable=True, index=True)
    service_type = Column(String(20), default="standard")
    shipped_at = Column(DateTime(timezone=True), nullable=True)
    estimated_delivery = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="pending")
    current_location = Column(String(255), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    order = relationship("Order", backref="shipments")

    __table_args__ = (
        Index("ix_shipments_tracking", "carrier", "tracking_number"),
    )

    def __repr__(self):
        return f"<Shipment {self.tracking_number} carrier={self.carrier} status={self.status}>"


class ReviewImage(Base):
    __tablename__ = "review_images"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    review_id = Column(GUID, ForeignKey("reviews.id"), nullable=False, index=True)
    url = Column(String(500), nullable=False)
    sort_order = Column(Integer, default=0)

    review = relationship("Review", backref="images")

    def __repr__(self):
        return f"<ReviewImage {self.id} review={self.review_id}>"


class ReviewVote(Base):
    __tablename__ = "review_votes"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    review_id = Column(GUID, ForeignKey("reviews.id"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    vote_type = Column(SAEnum(ReviewVoteType), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    review = relationship("Review", backref="votes")
    user = relationship("User")

    __table_args__ = (
        UniqueConstraint("review_id", "user_id", name="uq_review_vote_user"),
    )

    def __repr__(self):
        return f"<ReviewVote {self.vote_type.value} review={self.review_id} user={self.user_id}>"


class FlashSale(Base):
    __tablename__ = "flash_sales"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    banner_url = Column(String(500), nullable=True)
    discount_type = Column(SAEnum(DiscountType), nullable=False)
    discount_value = Column(Float, nullable=False)
    starts_at = Column(DateTime(timezone=True), nullable=False)
    ends_at = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    items = relationship("FlashSaleItem", back_populates="flash_sale", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("ends_at > starts_at", name="ck_flash_sale_dates"),
        Index("ix_flash_sales_active_dates", "is_active", "starts_at", "ends_at"),
    )

    def __repr__(self):
        return f"<FlashSale {self.title}>"


class FlashSaleItem(Base):
    __tablename__ = "flash_sale_items"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    flash_sale_id = Column(GUID, ForeignKey("flash_sales.id"), nullable=False, index=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False, index=True)
    sale_price = Column(Float, nullable=False)
    quantity_limit = Column(Integer, default=0)
    sold_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    flash_sale = relationship("FlashSale", back_populates="items")
    product = relationship("Product")

    __table_args__ = (
        UniqueConstraint("flash_sale_id", "product_id", name="uq_flash_sale_product"),
        CheckConstraint("sold_count <= quantity_limit", name="ck_flash_sale_sold"),
    )

    def __repr__(self):
        return f"<FlashSaleItem flash_sale={self.flash_sale_id} product={self.product_id}>"


class LoyaltyTransaction(Base):
    __tablename__ = "loyalty_transactions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    points = Column(Integer, nullable=False)
    transaction_type = Column(SAEnum(LoyaltyTransactionType), nullable=False)
    reference_type = Column(String(50), nullable=True)
    reference_id = Column(String(100), nullable=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="loyalty_transactions")

    __table_args__ = (
        Index("ix_loyalty_transactions_user_ref", "user_id", "reference_type", "reference_id"),
    )

    def __repr__(self):
        return f"<LoyaltyTransaction user={self.user_id} points={self.points} type={self.transaction_type.value}>"


class PrimeSubscription(Base):
    __tablename__ = "prime_subscriptions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    plan = Column(SAEnum(SubscriptionPlan), nullable=False)
    status = Column(SAEnum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    auto_renew = Column(Boolean, default=True)
    payment_gateway = Column(String(50), nullable=True)
    gateway_subscription_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="prime_subscription")

    __table_args__ = (
        CheckConstraint("end_date IS NULL OR end_date > start_date", name="ck_prime_dates"),
    )

    def __repr__(self):
        return f"<PrimeSubscription user={self.user_id} plan={self.plan.value} status={self.status.value}>"


class CommunityDiscussion(Base):
    __tablename__ = "community_discussions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(JSON, nullable=True)
    like_count = Column(Integer, default=0)
    reply_count = Column(Integer, default=0)
    is_pinned = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="discussions")
    product = relationship("Product")
    replies = relationship("CommunityReply", back_populates="discussion", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_community_discussions_pinned_created", "is_pinned", "created_at"),
    )

    def __repr__(self):
        return f"<CommunityDiscussion {self.title}>"


class CommunityReply(Base):
    __tablename__ = "community_replies"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    discussion_id = Column(GUID, ForeignKey("community_discussions.id"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    discussion = relationship("CommunityDiscussion", back_populates="replies")
    user = relationship("User", backref="replies")

    def __repr__(self):
        return f"<CommunityReply {self.id} discussion={self.discussion_id}>"


class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    ticket_id = Column(GUID, ForeignKey("support_tickets.id"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    attachment_url = Column(String(500), nullable=True)
    is_staff = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    ticket = relationship("SupportTicket", backref="messages")
    user = relationship("User")

    def __repr__(self):
        return f"<TicketMessage {self.id} ticket={self.ticket_id}>"


class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    tags = Column(JSON, nullable=True)
    helpful_count = Column(Integer, default=0)
    not_helpful_count = Column(Integer, default=0)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<KnowledgeBase {self.title}>"


class ABTestEvent(Base):
    __tablename__ = "ab_test_events"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    test_id = Column(GUID, ForeignKey("ab_tests.id"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    variant = Column(String(50), nullable=False)
    event_type = Column(String(100), nullable=False)
    event_value = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    test = relationship("ABTest", backref="events")
    user = relationship("User")

    __table_args__ = (
        Index("ix_ab_test_events_test_variant", "test_id", "variant"),
    )

    def __repr__(self):
        return f"<ABTestEvent test={self.test_id} variant={self.variant} event={self.event_type}>"
