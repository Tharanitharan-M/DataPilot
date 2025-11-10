"""
Vercel entry point for FastAPI application
Optimized for serverless deployment with graceful fallback
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
import os
import sys
import traceback

# First, try to import basic settings
try:
    from app.core.config import settings
    SETTINGS_LOADED = True
    print("✓ Settings loaded successfully")
except Exception as e:
    print(f"⚠ Warning: Could not load settings: {e}")
    SETTINGS_LOADED = False
    
    # Fallback settings
    class FallbackSettings:
        APP_NAME = "DataPilot"
        APP_VERSION = "1.0.0"
        DEBUG = False
        ENVIRONMENT = os.getenv("VERCEL_ENV", "production")
        CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
        
        @property
        def cors_origins_list(self):
            if self.CORS_ORIGINS == "*":
                return ["*"]
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    settings = FallbackSettings()

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=getattr(settings, 'DEBUG', False),
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    description="DataPilot API - Dataset Management Platform"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Try to load API routes (this might fail if database isn't configured)
ROUTES_LOADED = False
ROUTE_LOAD_ERROR = None

try:
    from app.api.routes import api_router
    app.include_router(api_router, prefix="/api/v1")
    ROUTES_LOADED = True
    print("✓ API routes loaded successfully")
except Exception as e:
    ROUTE_LOAD_ERROR = str(e)
    print(f"⚠ Warning: Could not load API routes: {e}")
    print(f"   Stack trace: {traceback.format_exc()}")
    print("   The API will work in minimal mode")
    print("   To enable full functionality, set DATABASE_URL environment variable")


@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    env = getattr(settings, 'ENVIRONMENT', os.getenv('VERCEL_ENV', 'production'))
    print("=" * 60)
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"📍 Environment: {env}")
    print(f"⚙️  Settings loaded: {SETTINGS_LOADED}")
    print(f"🔧 Routes loaded: {ROUTES_LOADED}")
    print(f"☁️  Vercel: {os.getenv('VERCEL', 'false')}")
    print(f"🌍 Region: {os.getenv('VERCEL_REGION', 'local')}")
    
    if not ROUTES_LOADED:
        print("⚠️  WARNING: Running in minimal mode!")
        print("   To enable full API functionality:")
        print("   1. Set DATABASE_URL environment variable in Vercel")
        print("   2. Example: postgresql://user:pass@host:5432/db")
        print(f"   Error: {ROUTE_LOAD_ERROR}")
    
    print("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    print(f"👋 Shutting down {settings.APP_NAME}")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "status": "running",
        "mode": "full" if ROUTES_LOADED else "minimal",
        "docs": "/api/docs",
        "health": "/health",
        "warning": None if ROUTES_LOADED else "Some features require DATABASE_URL to be configured"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint with detailed status"""
    health_status = {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": getattr(settings, 'ENVIRONMENT', os.getenv('VERCEL_ENV', 'production')),
        "settings_loaded": SETTINGS_LOADED,
        "routes_loaded": ROUTES_LOADED,
        "platform": {
            "vercel": os.getenv("VERCEL", "false"),
            "vercel_env": os.getenv("VERCEL_ENV", "unknown"),
            "vercel_region": os.getenv("VERCEL_REGION", "unknown")
        }
    }
    
    # Add error info if routes didn't load
    if not ROUTES_LOADED:
        health_status["warning"] = "Running in minimal mode - some features disabled"
        health_status["route_load_error"] = ROUTE_LOAD_ERROR
        health_status["required_env_vars"] = {
            "DATABASE_URL": "Not set" if not os.getenv("DATABASE_URL") else "Set"
        }
    
    return health_status


# Favicon endpoint (prevent 500 errors)
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Return 204 No Content for favicon requests"""
    return Response(status_code=204)


# Debug endpoint for troubleshooting
@app.get("/debug/env")
async def debug_env():
    """Check what environment variables are available (safe vars only)"""
    safe_vars = {
        "VERCEL": os.getenv("VERCEL"),
        "VERCEL_ENV": os.getenv("VERCEL_ENV"),
        "VERCEL_REGION": os.getenv("VERCEL_REGION"),
        "PYTHON_VERSION": os.getenv("PYTHON_VERSION"),
        "PATH": os.getenv("PATH", "")[:100] + "...",
        "DATABASE_URL": "Set" if os.getenv("DATABASE_URL") else "Not set",
        "REDIS_URL": "Set" if os.getenv("REDIS_URL") else "Not set",
        "CORS_ORIGINS": os.getenv("CORS_ORIGINS", "Not set"),
    }
    
    return {
        "environment": safe_vars,
        "working_directory": os.getcwd(),
        "python_executable": sys.executable,
        "python_version": sys.version,
        "settings_loaded": SETTINGS_LOADED,
        "routes_loaded": ROUTES_LOADED,
        "route_load_error": ROUTE_LOAD_ERROR if not ROUTES_LOADED else None
    }


# Setup instructions endpoint (helpful for first-time deployments)
@app.get("/setup")
async def setup_instructions():
    """Get setup instructions for first-time deployment"""
    is_configured = ROUTES_LOADED
    
    return {
        "configured": is_configured,
        "status": "Ready to use!" if is_configured else "Configuration required",
        "message": "Your API is fully configured and ready!" if is_configured else "Your API needs configuration to enable all features",
        "next_steps": [] if is_configured else [
            {
                "step": 1,
                "title": "Set up a PostgreSQL database",
                "description": "Use Neon (https://neon.tech) or Supabase (https://supabase.com) for free PostgreSQL hosting",
                "action": "Get your database connection string"
            },
            {
                "step": 2,
                "title": "Add DATABASE_URL to Vercel",
                "description": "Go to your Vercel project settings",
                "action": "Settings → Environment Variables → Add DATABASE_URL"
            },
            {
                "step": 3,
                "title": "Redeploy",
                "description": "After adding the environment variable",
                "action": "Vercel will automatically redeploy, or run: vercel --prod"
            }
        ],
        "current_status": {
            "settings_loaded": SETTINGS_LOADED,
            "routes_loaded": ROUTES_LOADED,
            "database_configured": bool(os.getenv("DATABASE_URL")),
            "error": ROUTE_LOAD_ERROR if not ROUTES_LOADED else None
        },
        "help": {
            "documentation": "/api/docs",
            "health_check": "/health",
            "debug_info": "/debug/env"
        }
    }
