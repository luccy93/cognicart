import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, Text, ForeignKey, Enum as SAEnum, Date, JSON
from sqlalchemy.orm import relationship
from app.models.uuid_type import GUID
import enum
from app.database import Base


class AddressType(str, enum.Enum):
    SHIPPING = "shipping"
    BILLING = "billing"
    BOTH = "both"


class Address(Base):
    __tablename__ = "addresses"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    label = Column(String(50), default="Home")
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    street = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False)
    address_type = Column(SAEnum(AddressType), default=AddressType.SHIPPING)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    discount_type = Column(String(20), nullable=False)  # percentage, fixed
    discount_value = Column(Float, nullable=False)
    min_order_value = Column(Float, default=0)
    max_discount = Column(Float, nullable=True)
    usage_limit = Column(Integer, default=1)
    used_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    starts_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # order_update, promotion, recommendation, price_drop, system
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    link = Column(String(500), nullable=True)
    is_read = Column(Boolean, default=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    query = Column(String(500), nullable=False)
    filters = Column(JSON, nullable=True)
    result_count = Column(Integer, default=0)
    clicked_product_id = Column(GUID, ForeignKey("products.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    order_id = Column(GUID, ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    gateway = Column(String(50), nullable=False)  # stripe, razorpay, cod
    gateway_payment_id = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    status = Column(String(50), default="pending")  # pending, completed, failed, refunded
    gateway_response = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    insight_type = Column(String(50), nullable=False)  # preference_shift, price_prediction, category_affinity, next_purchase
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)
    data = Column(JSON, nullable=True)
    is_actioned = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    occupation = Column(String(100), nullable=True)
    interests = Column(Text, nullable=True)
    preferred_language = Column(String(10), default="en")
    notification_preferences = Column(JSON, nullable=True)
    privacy_settings = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User")
