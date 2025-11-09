"""User model for authentication and authorization"""

from sqlalchemy import Column, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class User(BaseModel):
    """
    User model - Maps to Clerk Users
    Each user belongs to an organization (tenant)
    """
    
    __tablename__ = "users"
    
    # Primary key
    id = Column(String(255), primary_key=True)  # Clerk user_id
    
    # User details
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    
    # Profile
    image_url = Column(String(500), nullable=True)
    username = Column(String(255), unique=True, nullable=True, index=True)
    
    # Organization relationship (tenant)
    organization_id = Column(String(255), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Role in organization
    role = Column(String(50), default="member", nullable=False)  # admin, member, viewer
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    public_metadata = Column(Text, nullable=True)  # JSON stored as text
    private_metadata = Column(Text, nullable=True)  # JSON stored as text
    
    # Clerk sync
    clerk_created_at = Column(String(50), nullable=True)
    clerk_updated_at = Column(String(50), nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, org={self.organization_id})>"
    
    @property
    def full_name(self):
        """Get user's full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name or self.last_name or self.email

