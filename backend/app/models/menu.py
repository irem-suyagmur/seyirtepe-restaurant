from sqlalchemy import Column, Integer, String, Float, Boolean, Text
from app.database import Base


class MenuItem(Base):
    __tablename__ = "menu_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    name_en = Column(String)
    description = Column(Text)
    description_en = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False)  # Ana Yemek, İçecek, Tatlı, etc.
    image_url = Column(String)
    is_available = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    allergens = Column(String)  # JSON string
    calories = Column(Integer)
