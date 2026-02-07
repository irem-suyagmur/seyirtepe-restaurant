from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.models.menu import MenuItem as MenuItemModel
from app.schemas.menu import MenuItemCreate


class MenuService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_all_items(self, category: Optional[str] = None) -> List[MenuItemModel]:
        """Tüm menü öğelerini getir"""
        query = select(MenuItemModel)
        if category:
            query = query.where(MenuItemModel.category == category)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_item_by_id(self, item_id: int) -> Optional[MenuItemModel]:
        """ID'ye göre menü öğesi getir"""
        result = await self.db.execute(
            select(MenuItemModel).where(MenuItemModel.id == item_id)
        )
        return result.scalar_one_or_none()
    
    async def create_item(self, item: MenuItemCreate) -> MenuItemModel:
        """Yeni menü öğesi oluştur"""
        db_item = MenuItemModel(**item.dict())
        self.db.add(db_item)
        await self.db.commit()
        await self.db.refresh(db_item)
        return db_item
