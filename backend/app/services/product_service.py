from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self) -> List[Product]:
        """Tüm ürünleri getir"""
        return self.db.query(Product).order_by(Product.display_order).all()
    
    def get_by_id(self, product_id: int, with_category: bool = False) -> Optional[Product]:
        """ID'ye göre ürün getir"""
        query = self.db.query(Product)
        if with_category:
            query = query.options(joinedload(Product.category))
        return query.filter(Product.id == product_id).first()
    
    def get_by_category(self, category_id: int) -> List[Product]:
        """Kategoriye göre ürünleri getir"""
        return (
            self.db.query(Product)
            .filter(Product.category_id == category_id)
            .order_by(Product.display_order)
            .all()
        )
    
    def create(self, product: ProductCreate) -> Product:
        """Yeni ürün oluştur"""
        db_product = Product(**product.dict())
        self.db.add(db_product)
        self.db.commit()
        self.db.refresh(db_product)
        return db_product
    
    def update(self, product_id: int, product_update: ProductUpdate) -> Optional[Product]:
        """Ürün güncelle"""
        db_product = self.get_by_id(product_id)
        if not db_product:
            return None
        
        update_data = product_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        
        self.db.commit()
        self.db.refresh(db_product)
        return db_product
    
    def delete(self, product_id: int) -> bool:
        """Ürün sil"""
        db_product = self.get_by_id(product_id)
        if not db_product:
            return False
        
        self.db.delete(db_product)
        self.db.commit()
        return True
