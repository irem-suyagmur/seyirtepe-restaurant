from pydantic import BaseModel, field_validator
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
    
    @field_validator('status')
    @classmethod
    def normalize_status(cls, v):
        """Normalize status to lowercase for consistent API responses."""
        if v:
            return str(v).lower()
        return 'pending'
    
    class Config:
        from_attributes = True
