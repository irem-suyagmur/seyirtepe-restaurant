from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ReservationBase(BaseModel):
    customer_name: str
    customer_phone: str
    date: datetime
    guests: int
    special_requests: Optional[str] = None


class ReservationCreate(ReservationBase):
    # Accept email as optional string (can be None, empty, or valid email)
    customer_email: Optional[str] = None


class Reservation(ReservationBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    customer_email: Optional[str] = None
    
    class Config:
        from_attributes = True
        orm_mode = True  # Pydantic v1 compatibility
