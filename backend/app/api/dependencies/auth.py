"""Authentication dependencies for FastAPI routes"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.clerk import verify_clerk_token
from app.db.session import get_db
from app.models.user import User
from app.models.organization import Organization


security = HTTPBearer()


class AuthenticatedUser:
    """Container for authenticated user information"""
    
    def __init__(
        self,
        user_id: str,
        email: str,
        organization_id: Optional[str] = None,
        role: str = "member",
        token_payload: dict = None
    ):
        self.user_id = user_id
        self.email = email
        self.organization_id = organization_id
        self.role = role
        self.token_payload = token_payload or {}
    
    def is_admin(self) -> bool:
        """Check if user is an admin"""
        return self.role == "admin"
    
    def has_organization(self) -> bool:
        """Check if user belongs to an organization"""
        return self.organization_id is not None
    
    def __repr__(self):
        return f"<AuthenticatedUser(id={self.user_id}, org={self.organization_id})>"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> AuthenticatedUser:
    """
    Dependency to get current authenticated user from Clerk token
    
    Usage:
        @app.get("/protected")
        def protected_route(user: AuthenticatedUser = Depends(get_current_user)):
            return {"user_id": user.user_id}
    """
    token = credentials.credentials
    
    try:
        # Verify Clerk token
        payload = verify_clerk_token(token)
        
        # Extract user info from token
        user_id = payload.get("sub")
        email = payload.get("email")
        org_id = payload.get("org_id")
        org_role = payload.get("org_role")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID"
            )
        
        # Try to find user in database
        db_user = db.query(User).filter(User.id == user_id).first()
        
        # If user exists in DB, use their data
        if db_user:
            return AuthenticatedUser(
                user_id=db_user.id,
                email=db_user.email,
                organization_id=db_user.organization_id,
                role=db_user.role,
                token_payload=payload
            )
        
        # If user not in DB yet, return from token
        # (They'll be synced via webhook or on first API call)
        return AuthenticatedUser(
            user_id=user_id,
            email=email or "",
            organization_id=org_id,
            role=org_role or "member",
            token_payload=payload
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


async def get_current_active_user(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current active user from database
    Ensures user exists and is active
    
    Usage:
        @app.get("/profile")
        def get_profile(user: User = Depends(get_current_active_user)):
            return {"name": user.full_name}
    """
    user = db.query(User).filter(User.id == current_user.user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in database"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


async def require_organization(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> str:
    """
    Dependency to require user to belong to an organization
    Returns organization_id
    
    Usage:
        @app.get("/org-data")
        def get_org_data(org_id: str = Depends(require_organization)):
            return {"org_id": org_id}
    """
    if not current_user.has_organization():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must belong to an organization to access this resource"
        )
    
    return current_user.organization_id


async def require_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Dependency to require user to be an admin
    
    Usage:
        @app.post("/admin/settings")
        def update_settings(user: User = Depends(require_admin)):
            return {"message": "Settings updated"}
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return current_user


# Optional authentication (doesn't raise error if no token)
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[AuthenticatedUser]:
    """
    Optional authentication - returns None if no token provided
    
    Usage:
        @app.get("/public-or-private")
        def mixed_route(user: Optional[AuthenticatedUser] = Depends(get_current_user_optional)):
            if user:
                return {"message": "authenticated"}
            return {"message": "public"}
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None

