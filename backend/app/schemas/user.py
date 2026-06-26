from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    avatar_url: Optional[str]
    role: str
    is_active: bool
    is_verified: bool
    is_email_verified: bool
    email_verified_at: Optional[datetime]
    last_login: Optional[datetime]
    failed_login_attempts: int
    bio: Optional[str]
    shipping_address: Optional[str]
    city: Optional[str]
    country: Optional[str]
    loyalty_points: int
    tier: str
    total_orders: int
    total_spent: float
    preferred_categories: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    shipping_address: Optional[str] = None
    billing_address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    preferred_categories: Optional[str] = None
    avatar_url: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenRefresh(BaseModel):
    refresh_token: str


class ForgotPassword(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    email: EmailStr
    token: str
    password: str = Field(..., min_length=8)


class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str


class VerifyEmail(BaseModel):
    email: EmailStr
    otp: str


class ResendOTP(BaseModel):
    email: EmailStr
    purpose: Optional[str] = "registration"


class SendLoginOTP(BaseModel):
    email: EmailStr


class VerifyLoginOTP(BaseModel):
    email: EmailStr
    otp: str


class OAuthLogin(BaseModel):
    provider: str
    token: str
