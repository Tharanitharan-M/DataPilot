"""Database session management - Serverless optimized"""

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import os

# Base class for models (always available)
Base = declarative_base()

# Global variables
engine = None
SessionLocal = None
SETTINGS_AVAILABLE = False
IS_SERVERLESS = os.getenv("VERCEL", "false") == "1"
DATABASE_URL = None

# Try to load settings
try:
    from app.core.config import settings
    DATABASE_URL = settings.DATABASE_URL
    DEBUG = settings.DEBUG
    SETTINGS_AVAILABLE = True
except Exception as e:
    print(f"⚠ Warning: Could not load settings: {e}")
    DATABASE_URL = os.getenv("DATABASE_URL", "")
    DEBUG = False

# Only create engine if DATABASE_URL is provided
if DATABASE_URL and DATABASE_URL.strip():
    try:
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
    except Exception as e:
        print(f"❌ Failed to create database engine: {e}")
        print("   Continuing without database - API routes may not load")
        engine = None
        SessionLocal = None
else:
    print("⚠ No DATABASE_URL configured - database features disabled")
    print("   To enable database features:")
    print("   1. Set DATABASE_URL environment variable")
    print("   2. Example: postgresql://user:pass@host:5432/db")
    print("   3. For Vercel: Use Neon (https://neon.tech) or Supabase (https://supabase.com)")


def get_db():
    """
    Dependency to get database session
    
    Usage:
        @app.get("/items/")
        def read_items(db: Session = Depends(get_db)):
            ...
    
    Raises:
        RuntimeError: If database is not configured
    """
    if SessionLocal is None:
        raise RuntimeError(
            "Database not configured. "
            "Please set DATABASE_URL environment variable. "
            "Example: postgresql://user:password@host:5432/database"
        )
    
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise
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


def is_db_configured():
    """Check if database is configured and available"""
    return engine is not None and SessionLocal is not None
