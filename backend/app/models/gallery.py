from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base


class GalleryImage(Base):
    __tablename__ = "gallery_images"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    image_url = Column(String, nullable=False)
    thumbnail_url = Column(String)
    category = Column(String)  # Interior, Food, Events, View
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
