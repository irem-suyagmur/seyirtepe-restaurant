from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional


class ReservationBase(BaseModel):
    customer_name: str
    customer_phone: str
    date: datetime
    guests: int
    special_requests: Optional[str] = None


class ReservationCreate(ReservationBase):
    # Accept email as optional string (can be None or valid email)
    customer_email: Optional[str] = None
    
    @field_validator('customer_email')
    @classmethod
    def validate_email(cls, v):
        """Accept None, empty string, or valid email format."""
        if v is None or v == '':
            return None
        # Basic email check if provided
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v.strip()


class Reservation(ReservationBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    # Response field: plain string, no strict validation (allows empty/None)
    customer_email: Optional[str] = None
    
    @field_validator('status')
    @classmethod
    def normalize_status(cls, v):
        """Normalize status to lowercase for consistent API responses."""
        if v:
            return str(v).lower()
        return 'pending'
    
    class Config:
        from_attributes = True
