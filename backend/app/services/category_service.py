from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self) -> List[Category]:
        """Tüm kategorileri getir"""
        return self.db.query(Category).order_by(Category.display_order).all()
    
    def get_by_id(self, category_id: int) -> Optional[Category]:
        """ID'ye göre kategori getir"""
        return self.db.query(Category).filter(Category.id == category_id).first()
    
    def get_by_name(self, name: str) -> Optional[Category]:
        """İsme göre kategori getir"""
        return self.db.query(Category).filter(Category.name == name).first()
    
    def create(self, category: CategoryCreate) -> Category:
        """Yeni kategori oluştur"""
        db_category = Category(**category.dict())
        self.db.add(db_category)
        self.db.commit()
        self.db.refresh(db_category)
        return db_category
    
    def update(self, category_id: int, category_update: CategoryUpdate) -> Optional[Category]:
        """Kategori güncelle"""
        db_category = self.get_by_id(category_id)
        if not db_category:
            return None
        
        update_data = category_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_category, field, value)
        
        self.db.commit()
        self.db.refresh(db_category)
        return db_category
    
    def delete(self, category_id: int) -> bool:
        """Kategori sil"""
        db_category = self.get_by_id(category_id)
        if not db_category:
            return False
        
        self.db.delete(db_category)
        self.db.commit()
        return True
