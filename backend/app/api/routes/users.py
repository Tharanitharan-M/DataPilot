"""User API endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User
from app.models.organization import Organization
from app.api.dependencies import get_current_user, get_current_active_user, AuthenticatedUser
from app.schemas.user import UserResponse, UserUpdate


router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user profile"""
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_current_user_profile(
    updates: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    # Update allowed fields
    if updates.first_name is not None:
        current_user.first_name = updates.first_name
    if updates.last_name is not None:
        current_user.last_name = updates.last_name
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.get("/organization/members", response_model=List[UserResponse])
def get_organization_members(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all members of the current user's organization
    (Tenant-isolated query)
    """
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must belong to an organization"
        )
    
    # Query only users from the same organization (tenant isolation)
    members = db.query(User).filter(
        User.organization_id == current_user.organization_id,
        User.is_active == True
    ).all()
    
    return members


@router.get("/organization/info")
def get_organization_info(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's organization information"""
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must belong to an organization"
        )
    
    org = db.query(Organization).filter(
        Organization.id == current_user.organization_id
    ).first()
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Get member count
    member_count = db.query(User).filter(
        User.organization_id == org.id,
        User.is_active == True
    ).count()
    
    return {
        "id": org.id,
        "name": org.name,
        "slug": org.slug,
        "image_url": org.image_url,
        "member_count": member_count,
        "max_members": org.max_members,
        "is_active": org.is_active,
        "created_at": org.created_at,
    }

