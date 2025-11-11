"""API routes for query execution and management"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import psycopg2
import json
import time
import os

from app.db.session import get_db
from app.models.user import User
from app.models.query import Query
from app.models.data_connection import DataConnection
from app.models.document import Document
from app.schemas.query import (
    QueryCreate,
    QueryExecute,
    QueryResponse,
    QueryResult,
    QuerySave,
    QueryListResponse,
)
from app.api.dependencies.auth import get_current_user
from app.utils.logger import logger

router = APIRouter()


def generate_sql_from_nl(
    natural_language_query: str,
    schema_info: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generate SQL from natural language using AWS Bedrock
    Returns dict with 'success', 'sql_query', 'error'
    """
    from app.services.bedrock_service import get_bedrock_service
    from app.core.config import settings
    
    # Check if Bedrock is enabled
    if not settings.BEDROCK_ENABLED:
        return {
            "success": False,
            "error": "AWS Bedrock is not enabled. Please configure AWS credentials and set BEDROCK_ENABLED=true",
        }
    
    try:
        # Get Bedrock service
        bedrock_service = get_bedrock_service()
        
        # Generate SQL
        result = bedrock_service.generate_sql(
            natural_language_query=natural_language_query,
            schema_info=schema_info,
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error in generate_sql_from_nl: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to generate SQL: {str(e)}",
        }


def get_database_schema(connection: DataConnection, db_password: str) -> Dict[str, Any]:
    """Get database schema information for SQL generation context"""
    try:
        from app.api.routes.connections import decrypt_password
        
        conn_string = (
            f"host={connection.host} "
            f"port={connection.port} "
            f"dbname={connection.database} "
            f"user={connection.username} "
            f"password={db_password}"
        )
        
        if connection.ssl_enabled:
            conn_string += " sslmode=require"
        
        conn = psycopg2.connect(conn_string, connect_timeout=5)
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        # Get columns for each table
        schema_info = {"tables": {}}
        
        for table in tables[:10]:  # Limit to 10 tables for performance
            cursor.execute(f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '{table}'
                ORDER BY ordinal_position;
            """)
            columns = cursor.fetchall()
            schema_info["tables"][table] = {
                "columns": [{"name": col[0], "type": col[1]} for col in columns]
            }
        
        cursor.close()
        conn.close()
        
        return schema_info
        
    except Exception as e:
        logger.error(f"Error getting database schema: {str(e)}")
        return {"tables": {}}


def execute_sql_query(
    connection: DataConnection,
    sql_query: str,
    db_password: str,
) -> Dict[str, Any]:
    """Execute SQL query on the database connection"""
    start_time = time.time()
    
    try:
        conn_string = (
            f"host={connection.host} "
            f"port={connection.port} "
            f"dbname={connection.database} "
            f"user={connection.username} "
            f"password={db_password}"
        )
        
        if connection.ssl_enabled:
            conn_string += " sslmode=require"
        
        conn = psycopg2.connect(conn_string, connect_timeout=5)
        cursor = conn.cursor()
        
        # Execute query
        cursor.execute(sql_query)
        
        # Fetch results
        if cursor.description:  # SELECT query
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            data = [dict(zip(columns, row)) for row in rows]
            row_count = len(data)
        else:  # INSERT/UPDATE/DELETE
            data = []
            columns = []
            row_count = cursor.rowcount
            conn.commit()
        
        cursor.close()
        conn.close()
        
        execution_time = int((time.time() - start_time) * 1000)
        
        return {
            "success": True,
            "columns": columns,
            "data": data,
            "row_count": row_count,
            "execution_time_ms": execution_time,
        }
        
    except psycopg2.Error as e:
        logger.error(f"SQL execution error: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "execution_time_ms": int((time.time() - start_time) * 1000),
        }
    except Exception as e:
        logger.error(f"Unexpected error during query execution: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "execution_time_ms": int((time.time() - start_time) * 1000),
        }


@router.post("/execute", response_model=QueryResult)
async def execute_query(
    query_data: QueryExecute,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Execute a natural language query"""
    logger.info(f"User {current_user.id} executing query: {query_data.natural_language_query[:100]}")
    
    # Validate that either connection_id or document_id is provided
    if not query_data.connection_id and not query_data.document_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either connection_id or document_id must be provided",
        )
    
    # Create query record
    query_record = Query(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        connection_id=query_data.connection_id,
        document_id=query_data.document_id,
        natural_language_query=query_data.natural_language_query,
        query_type="database" if query_data.connection_id else "document",
        status="pending",
    )
    
    db.add(query_record)
    db.commit()
    db.refresh(query_record)
    
    try:
        if query_data.connection_id:
            # Query against database connection
            connection = db.query(DataConnection).filter(
                DataConnection.id == query_data.connection_id,
                DataConnection.user_id == current_user.id,
            ).first()
            
            if not connection:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Connection not found",
                )
            
            # Get database schema
            from app.api.routes.connections import decrypt_password
            db_password = decrypt_password(connection.password)
            schema_info = get_database_schema(connection, db_password)
            
            # Generate SQL from natural language using AWS Bedrock
            sql_generation_result = generate_sql_from_nl(query_data.natural_language_query, schema_info)
            
            # Check if SQL generation was successful
            if not sql_generation_result.get("success"):
                query_record.status = "failed"
                query_record.error_message = sql_generation_result.get("error", "Failed to generate SQL")
                db.commit()
                
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=sql_generation_result.get("error", "Failed to generate SQL query"),
                )
            
            sql_query = sql_generation_result.get("sql_query")
            
            # Execute SQL query
            result = execute_sql_query(connection, sql_query, db_password)
            
            if result["success"]:
                # Update query record
                query_record.sql_query = sql_query
                query_record.result_data = json.dumps(result["data"])
                query_record.row_count = result["row_count"]
                query_record.execution_time_ms = result["execution_time_ms"]
                query_record.status = "success"
                db.commit()
                
                return QueryResult(
                    query_id=query_record.id,
                    sql_query=sql_query,
                    columns=result["columns"],
                    data=result["data"],
                    row_count=result["row_count"],
                    execution_time_ms=result["execution_time_ms"],
                    status="success",
                )
            else:
                # Query failed
                query_record.status = "failed"
                query_record.error_message = result["error"]
                query_record.sql_query = sql_query
                db.commit()
                
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Query execution failed: {result['error']}",
                )
        
        else:
            # Query against uploaded document
            document = db.query(Document).filter(
                Document.id == query_data.document_id,
                Document.user_id == current_user.id,
            ).first()
            
            if not document:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Document not found",
                )
            
            # TODO: Implement document querying
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Document querying not yet implemented. Coming soon!",
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing query: {str(e)}")
        query_record.status = "failed"
        query_record.error_message = str(e)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing query: {str(e)}",
        )


@router.get("/", response_model=QueryListResponse)
async def list_queries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = 1,
    page_size: int = 20,
    saved_only: bool = False,
):
    """List user's query history"""
    logger.info(f"User {current_user.id} listing queries")
    
    query = db.query(Query).filter(Query.user_id == current_user.id)
    
    if saved_only:
        query = query.filter(Query.is_saved == True)
    
    total = query.count()
    
    queries = query.order_by(Query.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return QueryListResponse(
        queries=queries,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{query_id}", response_model=QueryResponse)
async def get_query(
    query_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific query"""
    query = db.query(Query).filter(
        Query.id == query_id,
        Query.user_id == current_user.id,
    ).first()
    
    if not query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found",
        )
    
    return query


@router.post("/{query_id}/save", response_model=QueryResponse)
async def save_query(
    query_id: str,
    save_data: QuerySave,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save a query for future reference"""
    logger.info(f"User {current_user.id} saving query {query_id}")
    
    query = db.query(Query).filter(
        Query.id == query_id,
        Query.user_id == current_user.id,
    ).first()
    
    if not query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found",
        )
    
    query.is_saved = True
    query.title = save_data.title
    db.commit()
    db.refresh(query)
    
    return query


@router.delete("/{query_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_query(
    query_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a query"""
    logger.info(f"User {current_user.id} deleting query {query_id}")
    
    query = db.query(Query).filter(
        Query.id == query_id,
        Query.user_id == current_user.id,
    ).first()
    
    if not query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found",
        )
    
    db.delete(query)
    db.commit()
    
    return None

