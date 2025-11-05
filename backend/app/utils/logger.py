"""Logging configuration"""

import logging
import sys
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Create logger
logger = logging.getLogger("datapilot")


def get_logger(name: str = "datapilot") -> logging.Logger:
    """Get a logger instance"""
    return logging.getLogger(name)

