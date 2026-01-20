from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class OrderItem(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price: float


class OrderBase(BaseModel):
    customer_name: str
    customer_phone: str
    customer_address: Optional[str] = None
    items: List[OrderItem]
    total_amount: float
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    pass


class OrderStatusUpdate(BaseModel):
    status: str


class Order(OrderBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
