"""
──────────────────────────────────────────────
schemas/auth.py — Authentication Schemas
──────────────────────────────────────────────
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Arjun Sharma"])
    email: EmailStr = Field(..., examples=["arjun@example.com"])
    phone: Optional[str] = Field(None, pattern=r"^[6-9]\d{9}$", examples=["9876543210"])
    password: str = Field(..., min_length=8, max_length=72, examples=["SecurePass@123"])

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Access token expiry in seconds")


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: Optional[str]
    role: str
    city: Optional[str]
    avatar_url: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
