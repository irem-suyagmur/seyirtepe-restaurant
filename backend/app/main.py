from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api.v1.api import api_router
from app.config import settings
from app.database import init_db

app = FastAPI(
    title="Seyirtepe Restaurant Cafe API",
    description="Modern restaurant management API with reservation system",
    version="1.0.0"
)

# Uploads klasörünü oluştur ve statik servis et
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Veritabanını başlat
@app.on_event("startup")
def on_startup():
    init_db()

# API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "Seyirtepe Restaurant Cafe API",
        "status": "active",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
