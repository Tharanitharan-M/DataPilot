"""Redis client for caching"""

from typing import Optional
from app.core.config import settings

# Initialize Redis client
redis_client = None

if settings.REDIS_ENABLED:
    try:
        import redis
        redis_client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
        # Test connection
        redis_client.ping()
        print("✓ Redis connected successfully")
    except Exception as e:
        print(f"⚠ Redis connection failed: {e}")
        print("  Continuing without Redis - caching disabled")
        redis_client = None
else:
    print("⚠ Redis disabled in settings")


def get_redis():
    """Get Redis client instance (may be None if unavailable)"""
    return redis_client


def cache_get(key: str) -> Optional[str]:
    """Get value from cache"""
    if redis_client is None:
        return None
    try:
        return redis_client.get(key)
    except Exception:
        return None


def cache_set(key: str, value: str, expire: int = 3600) -> bool:
    """Set value in cache with expiration (default 1 hour)"""
    if redis_client is None:
        return False
    try:
        return redis_client.setex(key, expire, value)
    except Exception:
        return False


def cache_delete(key: str) -> bool:
    """Delete key from cache"""
    if redis_client is None:
        return False
    try:
        return bool(redis_client.delete(key))
    except Exception:
        return False


def cache_exists(key: str) -> bool:
    """Check if key exists in cache"""
    if redis_client is None:
        return False
    try:
        return bool(redis_client.exists(key))
    except Exception:
        return False
