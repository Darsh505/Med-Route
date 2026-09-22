"""
──────────────────────────────────────────────
services/auth_service.py — Authentication & Authorization
──────────────────────────────────────────────
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User, UserRole
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse

# bcrypt context — 12 rounds provides good security without being too slow
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": user_id,
        "role": role,
        "exp": expire,
        "type": "access",
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    payload = {"sub": user_id, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Returns decoded payload or None if invalid/expired."""
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None


class AuthService:

    async def register(
        self,
        db: AsyncSession,
        data: RegisterRequest,
    ) -> User:
        # Check email uniqueness
        existing = await db.execute(
            select(User).where(User.email == data.email)
        )
        if existing.scalar_one_or_none():
            raise ValueError("An account with this email already exists")

        user = User(
            name=data.name,
            email=data.email,
            phone=data.phone,
            password_hash=hash_password(data.password),
            role=UserRole.CITIZEN,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    async def login(
        self,
        db: AsyncSession,
        data: LoginRequest,
    ) -> TokenResponse:
        result = await db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.password_hash):
            raise ValueError("Invalid email or password")

        if not user.is_active:
            raise ValueError("Account has been deactivated")

        access_token = create_access_token(str(user.id), user.role.value)
        refresh_token = create_refresh_token(str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def get_current_user(
        self,
        db: AsyncSession,
        token: str,
    ) -> User:
        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            raise ValueError("Invalid or expired token")

        user_id = payload.get("sub")
        result = await db.execute(
            select(User).where(User.id == uuid.UUID(user_id), User.is_active == True)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("User not found")
        return user

    async def refresh_access_token(
        self,
        db: AsyncSession,
        refresh_token: str,
    ) -> TokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")

        result = await db.execute(
            select(User).where(User.id == uuid.UUID(payload["sub"]))
        )
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise ValueError("User not found or deactivated")

        return TokenResponse(
            access_token=create_access_token(str(user.id), user.role.value),
            refresh_token=create_refresh_token(str(user.id)),
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )


auth_service = AuthService()
