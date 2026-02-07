from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from pathlib import Path
from app.api.v1.api import api_router
from app.config import settings
from app.database import init_db
import os
import logging

is_production = (getattr(settings, "ENVIRONMENT", "development") or "development").lower() == "production"

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Seyirtepe Restaurant Cafe API",
    description="Modern restaurant management API with reservation system",
    version="1.0.0",
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
    openapi_url=None if is_production else "/openapi.json",
)

# Uploads klasörünü oluştur ve statik servis et
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

class _ExceptionToJSONMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        try:
            return await call_next(request)
        except HTTPException:
            raise
        except Exception as exc:
            # Avoid raw 500 responses (which browsers often surface as "CORS" issues
            # because headers are missing). Log details server-side.
            logger.exception("Unhandled server error")
            content = {"detail": "Internal Server Error"}
            if not is_production:
                content["error"] = type(exc).__name__
                content["message"] = str(exc)
            return JSONResponse(status_code=500, content=content)


# Error shielding first, then CORS so even error responses include CORS headers
app.add_middleware(_ExceptionToJSONMiddleware)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Safety net for production: accept both www and non-www for the main domain
    allow_origin_regex=r"^https?://(www\.)?seyirteperestaurantcafe\.com$",
)

# Veritabanını başlat
@app.on_event("startup")
def on_startup():
    init_db()
    
    # İlk deployment'ta seed data yükle
    if os.getenv("AUTO_SEED", "false").lower() == "true":
        try:
            from seed_data import seed_database
            seed_database()
            print("✅ Seed data başarıyla yüklendi!")
        except Exception as e:
            print(f"⚠️ Seed data yüklenemedi: {e}")

# API router
app.include_router(api_router, prefix="/api/v1")

# Backward-compatible routes (some frontend builds call without /api/v1)
# Keep disabled in production to reduce attack surface.
if not is_production:
    app.include_router(api_router, include_in_schema=False)

@app.get("/")
def root():
    return {
        "message": "Seyirtepe Restaurant Cafe API",
        "status": "active",
        "docs": None if is_production else "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
