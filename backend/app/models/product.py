import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.models.uuid_type import GUID
from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    icon = Column(String(50), nullable=True)
    parent_id = Column(GUID, ForeignKey("categories.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    parent = relationship("Category", remote_side=[id], back_populates="children")
    children = relationship("Category", back_populates="parent")
    products = relationship("Product", back_populates="category")

    def __repr__(self):
        return f"<Category {self.name}>"


class Product(Base):
    __tablename__ = "products"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    cost_price = Column(Float, nullable=True)
    currency = Column(String(3), default="USD")
    stock = Column(Integer, default=0)
    sku = Column(String(100), unique=True, nullable=True)
    barcode = Column(String(100), nullable=True)

    # Media
    thumbnail_url = Column(String(500), nullable=True)

    # Ratings
    average_rating = Column(Float, default=0.0)
    total_ratings = Column(Integer, default=0)
    total_reviews = Column(Integer, default=0)
    total_purchases = Column(Integer, default=0)
    popularity_score = Column(Integer, default=0)

    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_trending = Column(Boolean, default=False)
    has_variants = Column(Boolean, default=False)
    is_digital = Column(Boolean, default=False)

    # Category
    category_id = Column(GUID, ForeignKey("categories.id"), nullable=False, index=True)
    brand = Column(String(255), nullable=True)
    tags = Column(Text, nullable=True)

    # Dimensions
    weight = Column(Float, nullable=True)
    dimensions = Column(String(100), nullable=True)

    # Metadata
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    ratings_rel = relationship("Rating", back_populates="product")
    reviews_rel = relationship("Review", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    wishlist_items = relationship("Wishlist", back_populates="product")
    browsing_history = relationship("BrowsingHistory", back_populates="product")
    interactions = relationship("UserInteraction", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    recommendations = relationship("Recommendation", back_populates="product")

    def __repr__(self):
        return f"<Product {self.name}>"


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False)
    url = Column(String(500), nullable=False)
    alt_text = Column(String(255), nullable=True)
    sort_order = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    product = relationship("Product", back_populates="images")
