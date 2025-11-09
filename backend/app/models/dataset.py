"""Dataset model - Example of tenant-isolated data"""

from sqlalchemy import Column, String, ForeignKey, Integer, Text, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Dataset(BaseModel):
    """
    Dataset model - Example of tenant-scoped data
    All datasets belong to an organization
    """
    
    __tablename__ = "datasets"
    
    # Primary key
    id = Column(String(255), primary_key=True)
    
    # Organization relationship (tenant isolation)
    organization_id = Column(
        String(255), 
        ForeignKey("organizations.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    
    # Dataset details
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Creator
    created_by = Column(String(255), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Stats
    row_count = Column(Integer, default=0, nullable=False)
    column_count = Column(Integer, default=0, nullable=False)
    file_size = Column(Integer, default=0, nullable=False)  # in bytes
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Metadata (renamed from 'metadata' to avoid SQLAlchemy conflict)
    extra_metadata = Column(Text, nullable=True)  # JSON stored as text
    
    # Relationships
    organization = relationship("Organization", back_populates="datasets")
    creator = relationship("User")
    
    def __repr__(self):
        return f"<Dataset(id={self.id}, name={self.name}, org={self.organization_id})>"

