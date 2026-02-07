from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from datetime import datetime
import enum
from app.database import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Order(Base):
    """Sipariş modeli"""
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(200), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    customer_address = Column(Text, nullable=True)
    items = Column(JSON, nullable=False)  # [{product_id, product_name, quantity, price}]
    total_amount = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    # Use String instead of strict Enum to tolerate mixed case in existing DB data
    status = Column(String, default=OrderStatus.PENDING.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Order {self.id} - {self.customer_name}>"
