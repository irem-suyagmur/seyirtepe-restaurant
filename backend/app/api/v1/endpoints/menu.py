from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas.menu import MenuItem, MenuItemCreate
from app.services.menu_service import MenuService

router = APIRouter()


@router.get("/", response_model=List[MenuItem])
async def get_menu_items(
    category: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Tüm menü öğelerini getir"""
    service = MenuService(db)
    return await service.get_all_items(category)


@router.get("/{item_id}", response_model=MenuItem)
async def get_menu_item(
    item_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Belirli bir menü öğesini getir"""
    service = MenuService(db)
    item = await service.get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item


@router.post("/", response_model=MenuItem)
async def create_menu_item(
    item: MenuItemCreate,
    db: AsyncSession = Depends(get_db)
):
    """Yeni menü öğesi oluştur"""
    service = MenuService(db)
    return await service.create_item(item)
