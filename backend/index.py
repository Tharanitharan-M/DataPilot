"""
Vercel entry point for FastAPI application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

# Import with error handling
try:
    from app.core.config import settings
    from app.api.routes import api_router
    USE_FULL_APP = True
except Exception as e:
    print(f"Warning: Could not import full app: {e}")
    USE_FULL_APP = False
    
    # Fallback settings for basic functionality
    class FallbackSettings:
        APP_NAME = "DataPilot"
        APP_VERSION = "1.0.0"
        DEBUG = False
        CORS_ORIGINS = "*"
        
        @property
        def cors_origins_list(self):
            return ["*"] if self.CORS_ORIGINS == "*" else self.CORS_ORIGINS.split(",")
    
    settings = FallbackSettings()

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
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
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    print(f"Shutting down {settings.APP_NAME}")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "full_app_loaded": USE_FULL_APP
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
        "health": "/health"
    }


# Favicon endpoint (prevent 500 errors)
@app.get("/favicon.ico")
async def favicon():
    """Return 204 No Content for favicon requests"""
    return Response(status_code=204)


# Include API routes if available
if USE_FULL_APP:
    try:
        app.include_router(api_router, prefix="/api/v1")
        print("✓ API routes loaded successfully")
    except Exception as e:
        print(f"Warning: Could not load API routes: {e}")

