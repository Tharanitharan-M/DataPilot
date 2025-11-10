"""
DataPilot - Main FastAPI Application (Local Development)
Use this for local development with: uvicorn main:app --reload
For Vercel deployment, api/index.py is used automatically
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import api_router
from app.utils.logger import logger

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
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    
    # Check database connection
    from app.db.session import check_db_connection
    if check_db_connection():
        logger.info("✓ Database connection successful")
    else:
        logger.warning("⚠ Database connection failed or not configured")
    
    # Check Redis connection
    from app.db.redis_client import is_redis_available
    if is_redis_available():
        logger.info("✓ Redis connection successful")
    else:
        logger.warning("⚠ Redis not available - caching disabled")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info(f"Shutting down {settings.APP_NAME}")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from app.db.session import check_db_connection
    from app.db.redis_client import is_redis_available
    
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "connected" if check_db_connection() else "unavailable",
        "redis": "connected" if is_redis_available() else "unavailable"
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
        "health": "/health",
        "environment": settings.ENVIRONMENT
    }


# Favicon endpoint (prevent 500 errors)
@app.get("/favicon.ico")
async def favicon():
    """Return 204 No Content for favicon requests"""
    from fastapi.responses import Response
    return Response(status_code=204)


# Include API routes
app.include_router(api_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting {settings.APP_NAME} in development mode")
    logger.info(f"Server will be available at http://{settings.HOST}:{settings.PORT}")
    logger.info(f"API docs will be available at http://{settings.HOST}:{settings.PORT}/api/docs")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
