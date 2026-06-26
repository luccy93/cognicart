from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid


class CouponCreate(BaseModel):
    code: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None
    discount_type: str = Field(..., pattern="^(percentage|fixed)$")
    discount_value: float = Field(..., gt=0)
    min_order_value: float = Field(default=0, ge=0)
    max_discount: Optional[float] = None
    usage_limit: int = Field(default=1, ge=1)
    is_active: bool = True
    expires_at: Optional[datetime] = None


class CouponValidate(BaseModel):
    code: str = Field(..., min_length=1)
    order_total: float = Field(..., ge=0)


class CouponResponse(BaseModel):
    id: uuid.UUID
    code: str
    description: Optional[str]
    discount_type: str
    discount_value: float
    min_order_value: float
    max_discount: Optional[float]
    usage_limit: int
    used_count: int
    is_active: bool
    expires_at: Optional[datetime]

    model_config = {"from_attributes": True}
