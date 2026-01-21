from pydantic_settings import BaseSettings
from typing import List, Optional
from pydantic import model_validator


class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"  # development | production

    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Seyirtepe Restaurant Cafe"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://seyirtepe-frontend.onrender.com",
        "https://seyirteperestaurantcafe.com",
        "https://www.seyirteperestaurantcafe.com",
        "http://seyirteperestaurantcafe.com",
        "http://www.seyirteperestaurantcafe.com",
        "https://decimus.maxicloud.online",
        "http://decimus.maxicloud.online"
    ]
    
    # Database (SQLite)
    DATABASE_URL: str = "sqlite:///./seyirtepe.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Admin Auth
    ADMIN_EMAIL: str = "admin@seyirtepe.com"
    ADMIN_PASSWORD: str = ""  # set via env in production
    ADMIN_PASSWORD_HASH: Optional[str] = None  # bcrypt hash preferred

    @model_validator(mode="after")
    def _validate_security(self):
        env = (self.ENVIRONMENT or "development").lower()
        if env == "production":
            if self.SECRET_KEY in {"your-secret-key-change-in-production", "CHANGE_ME", ""}:
                raise ValueError("SECRET_KEY must be set in production")
            if not self.ADMIN_PASSWORD_HASH and not self.ADMIN_PASSWORD:
                raise ValueError("Set ADMIN_PASSWORD or ADMIN_PASSWORD_HASH in production")
        return self
    
    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = "info@seyirtepe.com"
    EMAILS_FROM_NAME: str = "Seyirtepe Restaurant"
    
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
