"""API dependencies for dependency injection"""

from app.db.session import get_db
from app.db.redis_client import get_redis

__all__ = ["get_db", "get_redis"]

