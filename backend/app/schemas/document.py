"""Pydantic schemas for documents"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class DocumentBase(BaseModel):
    """Base schema for document"""
    name: str = Field(..., description="Document name")
    description: Optional[str] = Field(None, description="Document description")


class DocumentCreate(DocumentBase):
    """Schema for creating a document (metadata only, file uploaded separately)"""
    organization_id: Optional[str] = None


class DocumentUpdate(BaseModel):
    """Schema for updating a document"""
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class DocumentResponse(DocumentBase):
    """Schema for document response"""
    id: str
    user_id: str
    organization_id: Optional[str] = None
    original_filename: str
    file_type: str
    file_size_bytes: int
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    columns: Optional[List[str]] = None
    status: str
    processing_error: Optional[str] = None
    table_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class DocumentPreview(BaseModel):
    """Schema for document data preview"""
    id: str
    name: str
    columns: List[str]
    sample_data: List[Dict[str, Any]]
    row_count: int
    column_count: int


class DocumentUploadResponse(BaseModel):
    """Schema for document upload response"""
    id: str
    name: str
    file_type: str
    file_size_bytes: int
    status: str
    message: str


class DocumentListResponse(BaseModel):
    """Schema for list of documents"""
    documents: List[DocumentResponse]
    total: int
    page: int
    page_size: int

