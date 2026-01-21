from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum, JSON
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
    # Store enum VALUES ("pending") rather than NAMES ("PENDING") for Postgres
    # compatibility across migrations.
    status = Column(
        Enum(
            OrderStatus,
            name="orderstatus",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        default=OrderStatus.PENDING,
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Order {self.id} - {self.customer_name}>"
