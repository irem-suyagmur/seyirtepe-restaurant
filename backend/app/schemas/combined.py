from pydantic import BaseModel
from typing import List
from app.schemas.category import Category
from app.schemas.product import Product


class CategoryWithProducts(Category):
    """Ürünleriyle birlikte kategori"""
    products: List[Product] = []
    
    class Config:
        from_attributes = True
