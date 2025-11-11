"""
Document model for storing uploaded files and their data
"""
from sqlalchemy import Column, String, Text, DateTime, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import uuid


class Document(Base):
    """Model for storing uploaded documents and their metadata"""
    
    __tablename__ = "documents"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column(String(255), ForeignKey("organizations.id"), nullable=True, index=True)
    
    # File details
    name = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # csv, excel, json, etc.
    file_size_bytes = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=True)  # S3 path or local path
    
    # Data details
    row_count = Column(Integer, nullable=True)
    column_count = Column(Integer, nullable=True)
    columns = Column(Text, nullable=True)  # JSON array of column names
    sample_data = Column(Text, nullable=True)  # JSON sample of first few rows
    
    # Processing status
    status = Column(String(50), nullable=False, default="uploading")  # uploading, processing, ready, failed
    processing_error = Column(Text, nullable=True)
    
    # Table storage (for querying)
    table_name = Column(String(255), nullable=True)  # If stored in database
    
    # Metadata
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="documents")
    organization = relationship("Organization", back_populates="documents")
    queries = relationship("Query", back_populates="document", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Document {self.name} ({self.file_type})>"

