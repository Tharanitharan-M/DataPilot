"""
Vercel entry point for FastAPI application
Vercel looks for 'app' instance in index.py, app.py, or server.py
"""

from main import app

# This is what Vercel will use
__all__ = ["app"]

