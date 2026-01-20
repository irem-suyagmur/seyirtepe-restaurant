from pydantic import BaseModel
from typing import Optional
from app.schemas.category import Category


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category_id: int
    display_order: int = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    display_order: Optional[int] = None


class Product(ProductBase):
    id: int
    
    class Config:
        from_attributes = True


class ProductWithCategory(Product):
    """Kategori bilgisiyle birlikte ürün"""
    category: Category
    
    class Config:
        from_attributes = True
