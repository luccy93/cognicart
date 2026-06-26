from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.schemas.product import ProductResponse


class RecommendationResponse(BaseModel):
    id: UUID
    product_id: UUID
    score: float
    engine: str
    recommendation_type: str
    product: Optional[ProductResponse]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RecommendationListResponse(BaseModel):
    items: List[RecommendationResponse]
    type: str
    total: int


class RecommendationFeedbackCreate(BaseModel):
    product_id: UUID
    recommendation_id: Optional[UUID] = None
    feedback_type: str
    rating: Optional[int] = None


class RecommendationAnalyticsResponse(BaseModel):
    accuracy: float
    precision_at_k: float
    recall_at_k: float
    user_satisfaction: float
    total_recommendations: int
    click_through_rate: float
    conversion_rate: float


class TrendingProductResponse(BaseModel):
    product: ProductResponse
    popularity_score: int
    trend_direction: str
    view_count: int
    purchase_count: int
