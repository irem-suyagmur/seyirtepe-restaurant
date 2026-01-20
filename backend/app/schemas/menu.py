from pydantic import BaseModel
from typing import Optional


class MenuItemBase(BaseModel):
    name: str
    name_en: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    price: float
    category: str
    image_url: Optional[str] = None
    is_available: bool = True
    is_featured: bool = False
    allergens: Optional[str] = None
    calories: Optional[int] = None


class MenuItemCreate(MenuItemBase):
    pass


class MenuItem(MenuItemBase):
    id: int
    
    class Config:
        from_attributes = True
