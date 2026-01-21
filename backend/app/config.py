from pydantic_settings import BaseSettings
from typing import List, Optional
from pydantic import field_validator, model_validator
from urllib.parse import urlparse
import json


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

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def _parse_allowed_origins(cls, v):
        # pydantic-settings may pass env vars as:
        # - a single comma-separated string
        # - a JSON list string (common on some hosts)
        if v is None:
            return v
        if isinstance(v, str):
            raw = v.strip()
            if raw.startswith("[") and raw.endswith("]"):
                try:
                    parsed = json.loads(raw)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except Exception:
                    # fall back to comma split
                    pass
            return [part.strip() for part in raw.split(",") if part.strip()]
        return v
    
    # Database (SQLite)
    DATABASE_URL: str = "sqlite:///./seyirtepe.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Admin Auth
    ADMIN_EMAIL: str = "admin@seyirtepe.com"
    # NOTE: Requested fallback credentials (not recommended for production)
    ADMIN_PASSWORD: str = "admin123"  # can still be overridden via env
    ADMIN_PASSWORD_HASH: Optional[str] = "$pbkdf2-sha256$29000$zNm7F.Ic49zb./9fC8GYMw$tBl6n53y/YFd2oPEIVCQIBwuZ0TchFljIiMTeK3F2b4"

    @model_validator(mode="after")
    def _validate_security(self):
        env = (self.ENVIRONMENT or "development").lower()

        # Always include the production public origins even if env overrides are incomplete.
        required_origins = {
            "https://seyirteperestaurantcafe.com",
            "https://www.seyirteperestaurantcafe.com",
            "http://seyirteperestaurantcafe.com",
            "http://www.seyirteperestaurantcafe.com",
        }

        # Normalize/expand allowed origins (avoid subtle www vs non-www CORS failures)
        normalized: List[str] = []
        for origin in list(self.ALLOWED_ORIGINS or []) + list(required_origins):
            if not origin:
                continue
            normalized.append(str(origin).rstrip("/"))

        expanded = set(normalized)
        for origin in list(normalized):
            parsed = urlparse(origin)
            if not parsed.scheme or not parsed.netloc:
                continue

            host = parsed.netloc
            if host.startswith("www."):
                alt_host = host[4:]
            else:
                alt_host = f"www.{host}"
            expanded.add(f"{parsed.scheme}://{alt_host}")

        self.ALLOWED_ORIGINS = list(expanded)

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
