from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db

router = APIRouter()


@router.get("/")
async def get_gallery_images(db: AsyncSession = Depends(get_db)):
    """Galeri resimlerini getir"""
    return {"message": "Gallery endpoint - coming soon"}


@router.post("/")
async def upload_image(db: AsyncSession = Depends(get_db)):
    """Galeri resmi yükle"""
    return {"message": "Upload endpoint - coming soon"}
