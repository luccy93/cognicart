from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[UUID] = None
    sort_order: Optional[int] = 0


class CategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    image_url: Optional[str]
    icon: Optional[str]
    parent_id: Optional[UUID]
    is_active: bool
    sort_order: int
    product_count: int = 0

    class Config:
        from_attributes = True


class ProductImageResponse(BaseModel):
    id: UUID
    url: str
    alt_text: Optional[str]
    sort_order: int
    is_primary: bool

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: float = Field(..., gt=0)
    original_price: Optional[float] = None
    stock: int = Field(default=0, ge=0)
    sku: Optional[str] = None
    category_id: UUID
    brand: Optional[str] = None
    tags: Optional[str] = None
    is_featured: bool = False
    is_trending: bool = False
    weight: Optional[float] = None
    dimensions: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[UUID] = None
    brand: Optional[str] = None
    tags: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None


class ProductResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    short_description: Optional[str]
    price: float
    original_price: Optional[float]
    currency: str
    stock: int
    sku: Optional[str]
    thumbnail_url: Optional[str]
    average_rating: float
    total_ratings: int
    total_reviews: int
    total_purchases: int
    popularity_score: int
    is_active: bool
    is_featured: bool
    is_trending: bool
    brand: Optional[str]
    tags: Optional[str]
    category_id: UUID
    category: Optional[CategoryResponse]
    images: List[ProductImageResponse] = []
    ai_match_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ProductSearchParams(BaseModel):
    q: Optional[str] = None
    category_id: Optional[UUID] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    brand: Optional[str] = None
    sort_by: Optional[str] = "popularity"
    sort_order: Optional[str] = "desc"
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    in_stock: Optional[bool] = None
    min_rating: Optional[float] = None


class RatingCreate(BaseModel):
    product_id: UUID
    rating: int = Field(..., ge=1, le=5)


class ReviewCreate(BaseModel):
    product_id: UUID
    title: Optional[str] = None
    content: str
    rating: int = Field(..., ge=1, le=5)


class ReviewResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_name: str
    user_avatar: Optional[str]
    title: Optional[str]
    content: str
    rating: int
    is_verified_purchase: bool
    helpful_count: int
    created_at: datetime

    class Config:
        from_attributes = True
