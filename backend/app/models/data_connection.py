"""
Database connection model for storing user's database credentials
"""
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import uuid


class DataConnection(Base):
    """Model for storing user's database connections"""
    
    __tablename__ = "data_connections"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column(String(255), ForeignKey("organizations.id"), nullable=True, index=True)
    
    # Connection details
    name = Column(String(255), nullable=False)  # User-friendly name
    connection_type = Column(String(50), nullable=False, default="postgresql")  # postgresql, mysql, etc.
    host = Column(String(255), nullable=False)
    port = Column(Integer, nullable=False, default=5432)
    database = Column(String(255), nullable=False)
    username = Column(String(255), nullable=False)
    password = Column(Text, nullable=False)  # We'll encrypt this
    
    # Additional settings
    ssl_enabled = Column(Boolean, default=False)
    connection_params = Column(Text, nullable=True)  # JSON string for additional params
    
    # Status
    is_active = Column(Boolean, default=True)
    last_tested_at = Column(DateTime(timezone=True), nullable=True)
    last_test_status = Column(String(50), nullable=True)  # success, failed
    last_test_error = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="data_connections")
    organization = relationship("Organization", back_populates="data_connections")
    queries = relationship("Query", back_populates="connection", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<DataConnection {self.name} ({self.connection_type})>"

