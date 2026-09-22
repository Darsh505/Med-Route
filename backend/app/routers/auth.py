"""
──────────────────────────────────────────────
routers/auth.py — Authentication Endpoints
──────────────────────────────────────────────

Endpoints:
  POST /api/auth/register → Create new citizen account
  POST /api/auth/login    → Get access + refresh tokens
  POST /api/auth/refresh  → Refresh expired access token
  GET  /api/auth/me       → Get current user profile
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse,
    RefreshRequest, UserResponse
)
from app.schemas import APIResponse
from app.services.auth_service import auth_service, decode_token
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """FastAPI dependency: extract and validate JWT, return current user."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "MISSING_TOKEN", "message": "Authorization header required"},
        )
    try:
        return await auth_service.get_current_user(db, credentials.credentials)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": str(e)},
        )


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency: require admin role."""
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "ADMIN_REQUIRED", "message": "Admin access required"},
        )
    return current_user


@router.post("/register", response_model=APIResponse[UserResponse], status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Create a new citizen account."""
    try:
        user = await auth_service.register(db, data)
        return APIResponse(
            data=UserResponse.model_validate(user),
            message="Account created successfully",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"code": "REGISTRATION_ERROR", "message": str(e)})


@router.post("/login", response_model=APIResponse[TokenResponse])
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email + password. Returns access + refresh tokens."""
    try:
        tokens = await auth_service.login(db, data)
        return APIResponse(data=tokens, message="Login successful")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "LOGIN_ERROR", "message": str(e)},
        )


@router.post("/refresh", response_model=APIResponse[TokenResponse])
async def refresh_token(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a valid refresh token for a new access token."""
    try:
        tokens = await auth_service.refresh_access_token(db, data.refresh_token)
        return APIResponse(data=tokens, message="Token refreshed")
    except ValueError as e:
        raise HTTPException(status_code=401, detail={"code": "REFRESH_ERROR", "message": str(e)})


@router.get("/me", response_model=APIResponse[UserResponse])
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return APIResponse(
        data=UserResponse.model_validate(current_user),
        message="Profile retrieved",
    )
