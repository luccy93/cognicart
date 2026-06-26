import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.models.uuid_type import GUID
import enum
from sqlalchemy import UniqueConstraint
from app.database import Base


class InteractionType(str, enum.Enum):
    VIEW = "view"
    CLICK = "click"
    ADD_TO_CART = "add_to_cart"
    ADD_TO_WISHLIST = "add_to_wishlist"
    PURCHASE = "purchase"
    SEARCH = "search"
    SHARE = "share"
    COMPARE = "compare"


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="ratings")
    product = relationship("Product", back_populates="ratings_rel")

    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='uq_user_product_rating'),
    )


class Review(Base):
    __tablename__ = "reviews"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False, index=True)
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False)
    is_verified_purchase = Column(Boolean, default=False)
    helpful_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews_rel")


class BrowsingHistory(Base):
    __tablename__ = "browsing_history"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False, index=True)
    time_spent = Column(Integer, default=0)
    viewed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="browsing_history")
    product = relationship("Product", back_populates="browsing_history")


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False)
    added_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_items")

    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='uq_user_product_wishlist'),
    )


class UserInteraction(Base):
    __tablename__ = "user_interactions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False, index=True)
    interaction_type = Column(SAEnum(InteractionType), nullable=False)
    interaction_value = Column(Float, default=1.0)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="interactions")
    product = relationship("Product", back_populates="interactions")
