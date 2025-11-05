"""Helper utility functions"""

from datetime import datetime
from typing import Any, Dict, Optional


def format_datetime(dt: datetime, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Format datetime object to string"""
    return dt.strftime(format_str)


def parse_datetime(dt_str: str, format_str: str = "%Y-%m-%d %H:%M:%S") -> datetime:
    """Parse string to datetime object"""
    return datetime.strptime(dt_str, format_str)


def safe_dict_get(d: Dict[str, Any], key: str, default: Any = None) -> Any:
    """Safely get value from dictionary with default"""
    return d.get(key, default)


def remove_none_values(d: Dict[str, Any]) -> Dict[str, Any]:
    """Remove None values from dictionary"""
    return {k: v for k, v in d.items() if v is not None}

