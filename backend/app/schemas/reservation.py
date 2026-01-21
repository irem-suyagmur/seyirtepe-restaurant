from pydantic import BaseModel, EmailStr, field_serializer
from datetime import datetime
from typing import Optional, Union


class ReservationBase(BaseModel):
    customer_name: str
    customer_email: Optional[EmailStr] = None
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
    
    # Allow DB empty strings to serialize as None for response validation
    customer_email: Optional[str] = None
    
    @field_serializer('customer_email')
    def _serialize_email(self, value: Optional[str]) -> Optional[str]:
        """Normalize empty/invalid emails to None for API responses."""
        if not value or not value.strip():
            return None
        return value
    
    class Config:
        from_attributes = True
