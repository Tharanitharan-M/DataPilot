"""
Minimal Vercel FastAPI Entry Point
This MUST work - if this fails, something is fundamentally wrong
"""

from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Create the simplest possible FastAPI app
app = FastAPI(title="DataPilot API", version="1.0.0")


@app.get("/")
def read_root():
    """Root endpoint - if you can see this, FastAPI is working on Vercel"""
    return {
        "message": "Welcome to DataPilot API",
        "version": "1.0.0",
        "status": "minimal_mode",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": "DataPilot",
        "version": "1.0.0",
        "mode": "minimal"
    }


@app.get("/favicon.ico")
def favicon():
    """Prevent 404 errors for favicon"""
    return JSONResponse(status_code=204, content=None)


# Test endpoint to verify Vercel environment
@app.get("/debug/env")
def debug_env():
    """Check what environment variables are available"""
    import os
    
    # Only show safe env vars (not secrets)
    safe_vars = {
        "VERCEL": os.getenv("VERCEL"),
        "VERCEL_ENV": os.getenv("VERCEL_ENV"),
        "VERCEL_REGION": os.getenv("VERCEL_REGION"),
        "PYTHON_VERSION": os.getenv("PYTHON_VERSION"),
        "PATH": os.getenv("PATH", "")[:100] + "...",  # Truncate PATH
    }
    
    return {
        "environment": safe_vars,
        "working_directory": os.getcwd(),
        "python_executable": os.sys.executable
    }

