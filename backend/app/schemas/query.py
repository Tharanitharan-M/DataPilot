"""Pydantic schemas for queries"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class QueryBase(BaseModel):
    """Base schema for query"""
    natural_language_query: str = Field(..., description="The question in natural language")


class QueryCreate(QueryBase):
    """Schema for creating a new query"""
    connection_id: Optional[str] = Field(None, description="Database connection ID")
    document_id: Optional[str] = Field(None, description="Document ID")
    organization_id: Optional[str] = Field(None, description="Organization ID")


class QueryExecute(QueryBase):
    """Schema for executing a query"""
    connection_id: Optional[str] = None
    document_id: Optional[str] = None


class QueryResponse(QueryBase):
    """Schema for query response"""
    id: str
    user_id: str
    organization_id: Optional[str] = None
    connection_id: Optional[str] = None
    document_id: Optional[str] = None
    sql_query: Optional[str] = None
    query_type: str
    status: str
    row_count: Optional[int] = None
    execution_time_ms: Optional[int] = None
    error_message: Optional[str] = None
    is_saved: bool
    title: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class QueryResult(BaseModel):
    """Schema for query results"""
    query_id: str
    sql_query: str
    columns: List[str]
    data: List[Dict[str, Any]]
    row_count: int
    execution_time_ms: int
    status: str


class QuerySave(BaseModel):
    """Schema for saving a query"""
    title: str = Field(..., description="Title for the saved query")


class QueryListResponse(BaseModel):
    """Schema for list of queries"""
    queries: List[QueryResponse]
    total: int
    page: int
    page_size: int

