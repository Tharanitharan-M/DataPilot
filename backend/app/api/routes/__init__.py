"""API route handlers"""

from fastapi import APIRouter
from app.api.routes import webhooks, users, datasets, connections, queries

# Create main API router
api_router = APIRouter()

# Include route modules
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(connections.router, prefix="/connections", tags=["connections"])
api_router.include_router(queries.router, prefix="/queries", tags=["queries"])

