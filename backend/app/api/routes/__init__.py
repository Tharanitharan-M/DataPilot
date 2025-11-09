"""API route handlers"""

from fastapi import APIRouter
from app.api.routes import webhooks, users, datasets

# Create main API router
api_router = APIRouter()

# Include route modules
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])

