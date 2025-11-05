"""Redis client for caching"""

import redis
from typing import Optional
from app.core.config import settings

# Create Redis client
redis_client = redis.from_url(
    settings.REDIS_URL,
    decode_responses=True
)


def get_redis():
    """Get Redis client instance"""
    return redis_client


def cache_get(key: str) -> Optional[str]:
    """Get value from cache"""
    return redis_client.get(key)


def cache_set(key: str, value: str, expire: int = 3600) -> bool:
    """Set value in cache with expiration (default 1 hour)"""
    return redis_client.setex(key, expire, value)


def cache_delete(key: str) -> bool:
    """Delete key from cache"""
    return bool(redis_client.delete(key))


def cache_exists(key: str) -> bool:
    """Check if key exists in cache"""
    return bool(redis_client.exists(key))

