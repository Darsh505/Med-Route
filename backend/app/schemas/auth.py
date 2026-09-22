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
    name: Optional[str] = Field(None, min_length=2, max_length=100, examples=["Arjun Sharma"])
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)  # alias for name
    email: EmailStr = Field(..., examples=["arjun@example.com"])
    phone: Optional[str] = Field(None, pattern=r"^[6-9]\d{9}$", examples=["9876543210"])
    password: str = Field(..., min_length=6, max_length=72, examples=["SecurePass123"])
    role: Optional[str] = Field(default="citizen", examples=["citizen", "doctor", "hospital_admin"])

    @property
    def display_name(self) -> str:
        return self.name or self.full_name or self.email.split("@")[0]

    def model_post_init(self, __context):
        """Normalize name field."""
        if not self.name and self.full_name:
            self.name = self.full_name
        elif not self.name:
            self.name = self.email.split("@")[0] if self.email else "User"


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
