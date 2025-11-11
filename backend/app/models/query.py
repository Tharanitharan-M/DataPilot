"""
Query model for storing user queries and results
"""
from sqlalchemy import Column, String, Text, DateTime, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import uuid


class Query(Base):
    """Model for storing user queries and their results"""
    
    __tablename__ = "queries"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column(String(255), ForeignKey("organizations.id"), nullable=True, index=True)
    connection_id = Column(String(36), ForeignKey("data_connections.id"), nullable=True)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=True)
    
    # Query details
    natural_language_query = Column(Text, nullable=False)  # User's question
    sql_query = Column(Text, nullable=True)  # Generated SQL
    query_type = Column(String(50), nullable=False)  # database, document, general
    
    # Results
    result_data = Column(Text, nullable=True)  # JSON string of results
    row_count = Column(Integer, nullable=True)
    execution_time_ms = Column(Integer, nullable=True)
    
    # Status
    status = Column(String(50), nullable=False, default="pending")  # pending, success, failed
    error_message = Column(Text, nullable=True)
    
    # Metadata
    is_saved = Column(Boolean, default=False)  # User can save important queries
    title = Column(String(255), nullable=True)  # For saved queries
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="queries")
    organization = relationship("Organization", back_populates="queries")
    connection = relationship("DataConnection", back_populates="queries")
    document = relationship("Document", back_populates="queries")
    
    def __repr__(self):
        return f"<Query {self.id} - {self.query_type}>"

