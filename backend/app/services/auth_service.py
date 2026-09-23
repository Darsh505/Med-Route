"""
services/auth_service.py — Authentication & Authorization

Supports two modes:
- PostgreSQL mode: stores users in DB
- In-memory mode: stores users in memory_store (demo)

Both modes issue real JWT tokens that work throughout the app.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

try:
    import structlog
    logger = structlog.get_logger()
except ImportError:
    import logging
    logger = logging.getLogger("auth_service")

# fallback context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    try:
        return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")
    except Exception:
        return pwd_context.hash(password[:72])

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8")[:72], hashed.encode("utf-8"))
    except Exception:
        try:
            return pwd_context.verify(plain[:72], hashed)
        except Exception:
            return False

def create_access_token(user_id: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "role": role, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": user_id, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    """Returns decoded payload or None if invalid/expired."""
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None

# Token Response Schema
class TokenResponseData:
    def __init__(self, access_token: str, refresh_token: str, expires_in: int):
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.token_type = "bearer"
        self.expires_in = expires_in

class AuthService:

    def _is_memory_mode(self) -> bool:
        from app.database import USE_MEMORY_DB
        return USE_MEMORY_DB

    async def register(self, db, data) -> dict:
        """Register a new user (DB or in-memory)."""
        if self._is_memory_mode():
            return await self._register_memory(data)
        return await self._register_db(db, data)

    async def _register_memory(self, data) -> dict:
        from app.services.memory_store import memory_store
        if memory_store.get_user_by_email(data.email):
            raise ValueError("An account with this email already exists")
        password_hash = hash_password(data.password)
        name = getattr(data, 'name', None) or getattr(data, 'full_name', None) or "User"
        role = getattr(data, 'role', 'citizen') or 'citizen'
        user = memory_store.create_user(
            name=name,
            email=data.email,
            password_hash=password_hash,
            role=role,
            phone=getattr(data, 'phone', None),
        )
        return user

    async def _register_db(self, db, data) -> object:
        from sqlalchemy import select
        from app.models.user import User, UserRole
        existing = await db.execute(select(User).where(User.email == data.email))
        if existing.scalar_one_or_none():
            raise ValueError("An account with this email already exists")
        user = User(
            name=getattr(data, 'name', data.email.split('@')[0]),
            email=data.email,
            phone=getattr(data, 'phone', None),
            password_hash=hash_password(data.password),
            role=UserRole.CITIZEN,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    async def login(self, db, data) -> TokenResponseData:
        """Login with email + password."""
        if self._is_memory_mode():
            return await self._login_memory(data)
        return await self._login_db(db, data)

    async def _login_memory(self, data) -> TokenResponseData:
        from app.services.memory_store import memory_store
        user = memory_store.get_user_by_email(data.email)
        if not user or not verify_password(data.password, user["password_hash"]):
            raise ValueError("Invalid email or password")
        if not user.get("is_active", True):
            raise ValueError("Account has been deactivated")
        return TokenResponseData(
            access_token=create_access_token(user["id"], user["role"]),
            refresh_token=create_refresh_token(user["id"]),
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def _login_db(self, db, data) -> TokenResponseData:
        from sqlalchemy import select
        from app.models.user import User
        result = await db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()
        if not user or not verify_password(data.password, user.password_hash):
            raise ValueError("Invalid email or password")
        if not user.is_active:
            raise ValueError("Account has been deactivated")
        return TokenResponseData(
            access_token=create_access_token(str(user.id), user.role.value),
            refresh_token=create_refresh_token(str(user.id)),
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def get_current_user(self, db, token: str) -> dict:
        """Validate JWT token and return user dict or ORM object."""
        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            raise ValueError("Invalid or expired token")
        user_id = payload.get("sub")

        if self._is_memory_mode():
            from app.services.memory_store import memory_store
            user = memory_store.get_user_by_id(user_id)
            if not user or not user.get("is_active", True):
                raise ValueError("User not found")
            return user

        from sqlalchemy import select
        from app.models.user import User
        result = await db.execute(
            select(User).where(User.id == uuid.UUID(user_id), User.is_active == True)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("User not found")
        return user

    async def refresh_access_token(self, db, refresh_token: str) -> TokenResponseData:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")
        user_id = payload["sub"]

        if self._is_memory_mode():
            from app.services.memory_store import memory_store
            user = memory_store.get_user_by_id(user_id)
            if not user or not user.get("is_active", True):
                raise ValueError("User not found or deactivated")
            return TokenResponseData(
                access_token=create_access_token(user["id"], user["role"]),
                refresh_token=create_refresh_token(user["id"]),
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            )

        from sqlalchemy import select
        from app.models.user import User
        result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise ValueError("User not found or deactivated")
        return TokenResponseData(
            access_token=create_access_token(str(user.id), user.role.value),
            refresh_token=create_refresh_token(str(user.id)),
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

auth_service = AuthService()
