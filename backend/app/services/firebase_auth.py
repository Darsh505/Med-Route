"""services/firebase_auth.py — Firebase Admin SDK Integration"""

try:
    import structlog
    logger = structlog.get_logger()
except ImportError:
    import logging
    logger = logging.getLogger("firebase_auth")

from typing import Optional
from app.config import settings


def verify_firebase_token(id_token: str) -> Optional[dict]:
    """
    Verify a Firebase ID token using the Admin SDK.
    Returns the decoded token payload or None if invalid.
    Falls back gracefully if Firebase is not configured.
    """
    if not settings.FIREBASE_PROJECT_ID:
        logger.info("Firebase not configured — returning None (local JWT auth will be used)")
        return None

    try:
        import firebase_admin
        from firebase_admin import auth, credentials

        # Initialize app if not already done
        if not firebase_admin._apps:
            if hasattr(settings, 'FIREBASE_SERVICE_ACCOUNT_PATH') and settings.FIREBASE_SERVICE_ACCOUNT_PATH:
                cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
                firebase_admin.initialize_app(cred)
            else:
                # Use project ID only (limited functionality)
                firebase_admin.initialize_app(options={'projectId': settings.FIREBASE_PROJECT_ID})

        decoded = auth.verify_id_token(id_token)
        return {
            "uid": decoded.get("uid"),
            "email": decoded.get("email", ""),
            "name": decoded.get("name") or decoded.get("display_name", ""),
            "picture": decoded.get("picture"),
            "email_verified": decoded.get("email_verified", False),
        }
    except ImportError:
        logger.warning("firebase-admin not installed — Firebase auth unavailable")
        return None
    except Exception as e:
        logger.warning(f"Firebase token verification failed: {e}")
        return None
