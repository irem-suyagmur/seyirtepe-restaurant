from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db

router = APIRouter()


@router.get("/")
async def get_reviews(db: AsyncSession = Depends(get_db)):
    """Müşteri yorumlarını getir"""
    return {"message": "Reviews endpoint - coming soon"}


@router.post("/")
async def create_review(db: AsyncSession = Depends(get_db)):
    """Yeni yorum oluştur"""
    return {"message": "Create review endpoint - coming soon"}
