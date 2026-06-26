import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.models.uuid_type import GUID
import enum
from app.database import Base


class RecommendationType(str, enum.Enum):
    PERSONALIZED = "personalized"
    SIMILAR_PRODUCTS = "similar_products"
    TRENDING = "trending"
    FREQUENTLY_BOUGHT = "frequently_bought"
    CONTINUE_SHOPPING = "continue_shopping"
    POPULAR = "popular"


class RecommendationEngine(str, enum.Enum):
    SVD = "svd"
    DEEP_LEARNING = "deep_learning"
    CONTENT_BASED = "content_based"
    HYBRID = "hybrid"


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False)
    score = Column(Float, nullable=False)
    engine = Column(SAEnum(RecommendationEngine), nullable=False)
    recommendation_type = Column(SAEnum(RecommendationType), nullable=False)
    is_clicked = Column(Boolean, default=False)
    is_purchased = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    product = relationship("Product", back_populates="recommendations")


class RecommendationFeedback(Base):
    __tablename__ = "recommendation_feedback"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(GUID, ForeignKey("products.id"), nullable=False)
    recommendation_id = Column(GUID, ForeignKey("recommendations.id"), nullable=True)
    feedback_type = Column(String(50), nullable=False)
    rating = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
