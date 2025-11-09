"""Dataset schemas for API requests/responses"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DatasetBase(BaseModel):
    """Base dataset schema"""
    name: str
    description: Optional[str] = None


class DatasetCreate(DatasetBase):
    """Dataset creation schema"""
    pass


class DatasetUpdate(BaseModel):
    """Dataset update schema"""
    name: Optional[str] = None
    description: Optional[str] = None


class DatasetResponse(DatasetBase):
    """Dataset response schema"""
    id: str
    organization_id: str
    created_by: Optional[str] = None
    row_count: int
    column_count: int
    file_size: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

