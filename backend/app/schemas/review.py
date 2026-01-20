from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    customer_name: str
    customer_email: Optional[EmailStr] = None
    rating: float
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class Review(ReviewBase):
    id: int
    is_approved: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
