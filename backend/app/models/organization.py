"""Organization model for multi-tenant architecture"""

from sqlalchemy import Column, String, Boolean, Integer, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Organization(BaseModel):
    """
    Organization model - Root entity for multi-tenancy
    Maps to Clerk Organizations
    """
    
    __tablename__ = "organizations"
    
    # Primary key
    id = Column(String(255), primary_key=True)  # Clerk org_id
    
    # Organization details
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    
    # Metadata
    image_url = Column(String(500), nullable=True)
    public_metadata = Column(Text, nullable=True)  # JSON stored as text
    private_metadata = Column(Text, nullable=True)  # JSON stored as text
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    max_members = Column(Integer, default=10, nullable=False)
    
    # Clerk sync
    clerk_created_at = Column(String(50), nullable=True)
    clerk_updated_at = Column(String(50), nullable=True)
    
    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    datasets = relationship("Dataset", back_populates="organization", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Organization(id={self.id}, name={self.name}, slug={self.slug})>"

