"""Pydantic schemas for data connections"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DataConnectionBase(BaseModel):
    """Base schema for data connection"""
    name: str = Field(..., description="User-friendly name for the connection")
    connection_type: str = Field(default="postgresql", description="Type of database")
    host: str = Field(..., description="Database host")
    port: int = Field(default=5432, description="Database port")
    database: str = Field(..., description="Database name")
    username: str = Field(..., description="Database username")
    ssl_enabled: bool = Field(default=False, description="Enable SSL connection")


class DataConnectionCreate(DataConnectionBase):
    """Schema for creating a new data connection"""
    password: str = Field(..., description="Database password")
    organization_id: Optional[str] = Field(None, description="Organization ID (optional)")


class DataConnectionUpdate(BaseModel):
    """Schema for updating a data connection"""
    name: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    database: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    ssl_enabled: Optional[bool] = None
    is_active: Optional[bool] = None


class DataConnectionResponse(DataConnectionBase):
    """Schema for data connection response (password excluded)"""
    id: str
    user_id: str
    organization_id: Optional[str] = None
    is_active: bool
    last_tested_at: Optional[datetime] = None
    last_test_status: Optional[str] = None
    last_test_error: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class DataConnectionTest(BaseModel):
    """Schema for testing a database connection"""
    host: str
    port: int
    database: str
    username: str
    password: str
    ssl_enabled: bool = False


class DataConnectionTestResult(BaseModel):
    """Schema for connection test result"""
    success: bool
    message: str
    error: Optional[str] = None
    response_time_ms: Optional[int] = None

