from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class ReservationBase(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    date: datetime
    guests: int
    special_requests: Optional[str] = None


class ReservationCreate(ReservationBase):
    pass


class Reservation(ReservationBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
