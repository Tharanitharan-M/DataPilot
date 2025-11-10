"""Database session management - Serverless optimized"""

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import os

try:
    from app.core.config import settings
    SETTINGS_AVAILABLE = True
except Exception as e:
    print(f"⚠ Warning: Could not load settings: {e}")
    SETTINGS_AVAILABLE = False

# Determine if we're on Vercel (serverless)
IS_SERVERLESS = os.getenv("VERCEL", "false") == "1"

# Get database URL from settings or environment
if SETTINGS_AVAILABLE:
    DATABASE_URL = settings.DATABASE_URL
    DEBUG = settings.DEBUG
else:
    DATABASE_URL = os.getenv("DATABASE_URL", "")
    DEBUG = False

# Create database engine with serverless-friendly configuration
if DATABASE_URL:
    engine_config = {
        "pool_pre_ping": True,  # Test connections before using
        "echo": DEBUG,
    }
    
    if IS_SERVERLESS:
        # For serverless: use NullPool (no connection pooling)
        # Each function invocation gets a fresh connection
        engine_config["poolclass"] = NullPool
        print("🔧 Using NullPool for serverless (Vercel)")
    else:
        # For traditional deployment: use connection pooling
        engine_config["pool_size"] = 5
        engine_config["max_overflow"] = 10
        engine_config["pool_recycle"] = 3600  # Recycle connections after 1 hour
        print("🔧 Using connection pooling for traditional deployment")
    
    engine = create_engine(DATABASE_URL, **engine_config)
    
    # Create session factory
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    print("✓ Database engine created successfully")
else:
    # No database configured - this is okay for minimal deployments
    engine = None
    SessionLocal = None
    print("⚠ No DATABASE_URL configured - database features disabled")

# Base class for models
Base = declarative_base()


def get_db():
    """
    Dependency to get database session
    
    Usage:
        @app.get("/items/")
        def read_items(db: Session = Depends(get_db)):
            ...
    """
    if SessionLocal is None:
        raise RuntimeError("Database not configured. Please set DATABASE_URL environment variable.")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables (for development/testing only)"""
    if engine is None:
        print("⚠ Cannot initialize database - engine not available")
        return False
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables initialized")
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False


def check_db_connection():
    """Check if database connection is working"""
    if engine is None:
        return False
    
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"❌ Database connection check failed: {e}")
        return False
