from pydantic import BaseModel, EmailStr


class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    phone: str
    subject: str
    message: str
