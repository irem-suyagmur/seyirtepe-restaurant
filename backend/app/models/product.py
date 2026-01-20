from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Product(Base):
    """Ürün modeli (Menü öğeleri)"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(String(255), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    display_order = Column(Integer, default=0)
    
    # İlişkiler
    category = relationship("Category", back_populates="products")
    
    def __repr__(self):
        return f"<Product {self.name}>"
