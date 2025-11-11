"""Application configuration settings"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # Application
    APP_NAME: str = "DataPilot"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database (Neon PostgreSQL or local)
    DATABASE_URL: str = "postgresql://datapilot_user:datapilot_password@localhost:5432/datapilot_db"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    
    # Redis (optional - for caching/sessions)
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_ENABLED: bool = False
    
    # Clerk Authentication (Optional - will disable auth features if not set)
    CLERK_SECRET_KEY: str = ""  # Get from Clerk Dashboard
    CLERK_PUBLISHABLE_KEY: str = ""  # Get from Clerk Dashboard
    CLERK_DOMAIN: str = ""  # e.g., your-app.clerk.accounts.dev
    CLERK_WEBHOOK_SECRET: str = ""  # For webhook signature verification
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"
    
    # AWS Configuration
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    
    # AWS Bedrock LLM Configuration
    BEDROCK_MODEL_ID: str = "anthropic.claude-3-sonnet-20240229-v1:0"  # Claude 3 Sonnet
    BEDROCK_MAX_TOKENS: int = 4096
    BEDROCK_TEMPERATURE: float = 0.1  # Low temperature for more consistent SQL generation
    BEDROCK_ENABLED: bool = False  # Enable when AWS credentials are configured
    
    # Bedrock Guardrails (Optional - for additional safety)
    BEDROCK_GUARDRAIL_ID: str = ""  # Created in AWS Console
    BEDROCK_GUARDRAIL_VERSION: str = ""
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins into a list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def allowed_hosts_list(self) -> List[str]:
        """Parse allowed hosts into a list"""
        return [host.strip() for host in self.ALLOWED_HOSTS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from old .env


# Global settings instance
settings = Settings()

