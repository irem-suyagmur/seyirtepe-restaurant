from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from datetime import datetime
from app.database import Base


class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    customer_email = Column(String)
    rating = Column(Float, nullable=False)  # 1-5
    comment = Column(Text)
    is_approved = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
