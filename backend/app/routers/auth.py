"""
routers/auth.py — Authentication Endpoints

Endpoints:
  POST /api/auth/register  → Create new account
  POST /api/auth/login     → Get JWT access + refresh tokens
  POST /api/auth/refresh   → Refresh expired access token
  GET  /api/auth/me        → Get current user profile
  POST /api/auth/firebase  → Verify Firebase ID token (optional)
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

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
bearer_scheme = HTTPBearer(auto_error=False)

def _user_to_response(user) -> dict:
    """Convert user dict or ORM object to response dict."""
    if isinstance(user, dict):
        return {
            "id": str(user.get("id", "")),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "phone": user.get("phone"),
            "role": user.get("role", "citizen"),
            "city": user.get("city"),
            "avatar_url": user.get("avatar_url"),
            "is_active": user.get("is_active", True),
            "created_at": user.get("created_at", ""),
        }
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role.value if hasattr(user.role, 'value') else user.role,
        "city": user.city,
        "avatar_url": user.avatar_url,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if hasattr(user.created_at, 'isoformat') else str(user.created_at),
    }

def _tokens_to_response(tokens) -> dict:
    """Convert TokenResponseData to dict."""
    return {
        "access_token": tokens.access_token,
        "refresh_token": tokens.refresh_token,
        "token_type": "bearer",
        "expires_in": tokens.expires_in,
    }

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
):
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

async def require_admin(current_user=Depends(get_current_user)):
    """Dependency: require admin role."""
    role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user.role, 'value', current_user.role)
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "ADMIN_REQUIRED", "message": "Admin access required"},
        )
    return current_user

@router.post("/register", status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Create a new account. Accepts JSON body."""
    try:
        user = await auth_service.register(db, data)
        return APIResponse(
            data=_user_to_response(user),
            message="Account created successfully",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"code": "REGISTRATION_ERROR", "message": str(e)})

@router.post("/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email + password (JSON body). Returns access + refresh tokens."""
    try:
        tokens = await auth_service.login(db, data)
        return APIResponse(data=_tokens_to_response(tokens), message="Login successful")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "LOGIN_ERROR", "message": str(e)},
        )

@router.post("/refresh")
async def refresh_token(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a valid refresh token for a new access token."""
    try:
        tokens = await auth_service.refresh_access_token(db, data.refresh_token)
        return APIResponse(data=_tokens_to_response(tokens), message="Token refreshed")
    except ValueError as e:
        raise HTTPException(status_code=401, detail={"code": "REFRESH_ERROR", "message": str(e)})

@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return APIResponse(
        data=_user_to_response(current_user),
        message="Profile retrieved",
    )

@router.post("/firebase")
async def firebase_login(request: dict, db: AsyncSession = Depends(get_db)):
    """
    Verify a Firebase ID token and return a local JWT.
    Allows Firebase-authenticated users to access backend resources.
    """
    id_token = request.get("id_token") or request.get("idToken", "")
    if not id_token:
        raise HTTPException(status_code=400, detail={"code": "MISSING_TOKEN", "message": "Firebase ID token required"})

    try:
        from app.services.firebase_auth import verify_firebase_token
        firebase_user = verify_firebase_token(id_token)
        if not firebase_user:
            raise ValueError("Invalid Firebase token")

        email = firebase_user.get("email", "")
        name = firebase_user.get("name") or firebase_user.get("display_name") or email.split("@")[0]
        uid = firebase_user.get("uid", "")

        # Find or create user in our system
        from app.services.auth_service import create_access_token, create_refresh_token
        from app.config import settings

        if auth_service._is_memory_mode():
            from app.services.memory_store import memory_store
            user = memory_store.get_user_by_email(email)
            if not user:
                user = memory_store.create_user(name=name, email=email, password_hash="firebase-auth", role="citizen")
        else:
            from sqlalchemy import select
            from app.models.user import User, UserRole
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            if not user:
                user = User(name=name, email=email, password_hash="firebase-auth", role=UserRole.CITIZEN)
                db.add(user)
                await db.flush()
                await db.refresh(user)

        user_id = user.get("id") if isinstance(user, dict) else str(user.id)
        role = user.get("role") if isinstance(user, dict) else user.role.value

        tokens = {
            "access_token": create_access_token(str(user_id), str(role)),
            "refresh_token": create_refresh_token(str(user_id)),
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }
        return APIResponse(data=tokens, message="Firebase login successful")

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail={"code": "FIREBASE_AUTH_FAILED", "message": f"Firebase authentication failed: {str(e)}"}
        )
