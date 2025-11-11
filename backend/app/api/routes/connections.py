"""API routes for database connection management"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import psycopg2
import time
from cryptography.fernet import Fernet

from app.db.session import get_db
from app.models.user import User
from app.models.data_connection import DataConnection
from app.schemas.data_connection import (
    DataConnectionCreate,
    DataConnectionUpdate,
    DataConnectionResponse,
    DataConnectionTest,
    DataConnectionTestResult,
)
from app.api.dependencies.auth import get_current_user
from app.core.config import settings
from app.utils.logger import logger

router = APIRouter()

# Simple encryption for database passwords
# In production, use a proper key management service (AWS KMS, HashiCorp Vault, etc.)
def get_cipher():
    """Get encryption cipher for password encryption"""
    key = settings.SECRET_KEY.encode()[:32].ljust(32, b'0')  # Ensure 32 bytes
    return Fernet(Fernet.generate_key() if len(key) != 44 else key)


def encrypt_password(password: str) -> str:
    """Encrypt database password"""
    cipher = get_cipher()
    return cipher.encrypt(password.encode()).decode()


def decrypt_password(encrypted_password: str) -> str:
    """Decrypt database password"""
    cipher = get_cipher()
    return cipher.decrypt(encrypted_password.encode()).decode()


@router.post("/test", response_model=DataConnectionTestResult)
async def test_connection(
    connection_test: DataConnectionTest,
    current_user: User = Depends(get_current_user),
):
    """Test a database connection before saving it"""
    logger.info(f"User {current_user.id} testing database connection to {connection_test.host}")
    
    start_time = time.time()
    
    try:
        # Build connection string
        conn_string = (
            f"host={connection_test.host} "
            f"port={connection_test.port} "
            f"dbname={connection_test.database} "
            f"user={connection_test.username} "
            f"password={connection_test.password}"
        )
        
        if connection_test.ssl_enabled:
            conn_string += " sslmode=require"
        
        # Attempt connection
        conn = psycopg2.connect(conn_string, connect_timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        cursor.close()
        conn.close()
        
        response_time = int((time.time() - start_time) * 1000)
        
        logger.info(f"Connection test successful: {version[0][:50]}")
        
        return DataConnectionTestResult(
            success=True,
            message=f"Successfully connected to PostgreSQL database",
            response_time_ms=response_time,
        )
        
    except psycopg2.OperationalError as e:
        error_msg = str(e)
        logger.error(f"Connection test failed: {error_msg}")
        
        return DataConnectionTestResult(
            success=False,
            message="Failed to connect to database",
            error=error_msg,
        )
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Unexpected error during connection test: {error_msg}")
        
        return DataConnectionTestResult(
            success=False,
            message="Unexpected error occurred",
            error=error_msg,
        )


@router.post("/", response_model=DataConnectionResponse, status_code=status.HTTP_201_CREATED)
async def create_connection(
    connection: DataConnectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new database connection"""
    logger.info(f"User {current_user.id} creating database connection: {connection.name}")
    
    # Test connection first
    test_result = await test_connection(
        DataConnectionTest(
            host=connection.host,
            port=connection.port,
            database=connection.database,
            username=connection.username,
            password=connection.password,
            ssl_enabled=connection.ssl_enabled,
        ),
        current_user=current_user,
    )
    
    if not test_result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Connection test failed: {test_result.error}",
        )
    
    # Encrypt password before storing
    encrypted_password = encrypt_password(connection.password)
    
    # Create connection record
    db_connection = DataConnection(
        user_id=current_user.id,
        organization_id=connection.organization_id or current_user.organization_id,
        name=connection.name,
        connection_type=connection.connection_type,
        host=connection.host,
        port=connection.port,
        database=connection.database,
        username=connection.username,
        password=encrypted_password,
        ssl_enabled=connection.ssl_enabled,
        last_test_status="success",
        is_active=True,
    )
    
    db.add(db_connection)
    db.commit()
    db.refresh(db_connection)
    
    logger.info(f"Database connection created: {db_connection.id}")
    
    return db_connection


@router.get("/", response_model=List[DataConnectionResponse])
async def list_connections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    organization_id: str = None,
):
    """List all database connections for the current user or organization"""
    logger.info(f"User {current_user.id} listing database connections")
    
    query = db.query(DataConnection).filter(DataConnection.user_id == current_user.id)
    
    if organization_id:
        query = query.filter(DataConnection.organization_id == organization_id)
    elif current_user.organization_id:
        # Show both user's personal and organization connections
        query = query.filter(
            (DataConnection.user_id == current_user.id) | 
            (DataConnection.organization_id == current_user.organization_id)
        )
    
    connections = query.order_by(DataConnection.created_at.desc()).all()
    
    return connections


@router.get("/{connection_id}", response_model=DataConnectionResponse)
async def get_connection(
    connection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific database connection"""
    connection = db.query(DataConnection).filter(
        DataConnection.id == connection_id,
        DataConnection.user_id == current_user.id,
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )
    
    return connection


@router.put("/{connection_id}", response_model=DataConnectionResponse)
async def update_connection(
    connection_id: str,
    connection_update: DataConnectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a database connection"""
    logger.info(f"User {current_user.id} updating connection {connection_id}")
    
    connection = db.query(DataConnection).filter(
        DataConnection.id == connection_id,
        DataConnection.user_id == current_user.id,
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )
    
    # Update fields
    update_data = connection_update.model_dump(exclude_unset=True)
    
    # Encrypt password if provided
    if "password" in update_data:
        update_data["password"] = encrypt_password(update_data["password"])
    
    for field, value in update_data.items():
        setattr(connection, field, value)
    
    db.commit()
    db.refresh(connection)
    
    logger.info(f"Connection updated: {connection_id}")
    
    return connection


@router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connection(
    connection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a database connection"""
    logger.info(f"User {current_user.id} deleting connection {connection_id}")
    
    connection = db.query(DataConnection).filter(
        DataConnection.id == connection_id,
        DataConnection.user_id == current_user.id,
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )
    
    db.delete(connection)
    db.commit()
    
    logger.info(f"Connection deleted: {connection_id}")
    
    return None


@router.post("/{connection_id}/test", response_model=DataConnectionTestResult)
async def test_existing_connection(
    connection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Test an existing database connection"""
    logger.info(f"User {current_user.id} testing existing connection {connection_id}")
    
    connection = db.query(DataConnection).filter(
        DataConnection.id == connection_id,
        DataConnection.user_id == current_user.id,
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )
    
    # Decrypt password
    decrypted_password = decrypt_password(connection.password)
    
    # Test connection
    result = await test_connection(
        DataConnectionTest(
            host=connection.host,
            port=connection.port,
            database=connection.database,
            username=connection.username,
            password=decrypted_password,
            ssl_enabled=connection.ssl_enabled,
        ),
        current_user=current_user,
    )
    
    # Update test status
    connection.last_test_status = "success" if result.success else "failed"
    connection.last_test_error = result.error
    db.commit()
    
    return result

