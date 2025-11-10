"""
Vercel entry point for FastAPI application
Optimized for serverless deployment with graceful fallback
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
import os
import sys

# Import with error handling for full app
try:
    from app.core.config import settings
    from app.api.routes import api_router
    USE_FULL_APP = True
    print("✓ Full app imports successful")
except Exception as e:
    print(f"⚠ Warning: Could not import full app: {e}")
    USE_FULL_APP = False
    
    # Fallback settings for basic functionality
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


@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    env = getattr(settings, 'ENVIRONMENT', os.getenv('VERCEL_ENV', 'production'))
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"📍 Environment: {env}")
    print(f"🔧 Full app loaded: {USE_FULL_APP}")
    print(f"☁️  Vercel: {os.getenv('VERCEL', 'false')}")


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
        "mode": "full" if USE_FULL_APP else "minimal",
        "docs": "/api/docs",
        "health": "/health"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": getattr(settings, 'ENVIRONMENT', os.getenv('VERCEL_ENV', 'production')),
        "full_app_loaded": USE_FULL_APP,
        "platform": {
            "vercel": os.getenv("VERCEL", "false"),
            "vercel_env": os.getenv("VERCEL_ENV", "unknown"),
            "vercel_region": os.getenv("VERCEL_REGION", "unknown")
        }
    }


# Favicon endpoint (prevent 500 errors)
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Return 204 No Content for favicon requests"""
    return Response(status_code=204)


# Debug endpoint for troubleshooting (only show safe env vars)
@app.get("/debug/env")
async def debug_env():
    """Check what environment variables are available (safe vars only)"""
    safe_vars = {
        "VERCEL": os.getenv("VERCEL"),
        "VERCEL_ENV": os.getenv("VERCEL_ENV"),
        "VERCEL_REGION": os.getenv("VERCEL_REGION"),
        "PYTHON_VERSION": os.getenv("PYTHON_VERSION"),
        "PATH": os.getenv("PATH", "")[:100] + "...",
    }
    
    return {
        "environment": safe_vars,
        "working_directory": os.getcwd(),
        "python_executable": sys.executable,
        "python_version": sys.version,
        "full_app_loaded": USE_FULL_APP
    }


# Include API routes if available
if USE_FULL_APP:
    try:
        app.include_router(api_router, prefix="/api/v1")
        print("✓ API routes loaded successfully")
    except Exception as e:
        print(f"⚠ Warning: Could not load API routes: {e}")
        print(f"   The API will still work, but without full route functionality")
else:
    print("⚠ Running in minimal mode - API routes not loaded")
    print("   This is normal if dependencies are not yet configured")
