from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.contact import ContactMessage
from app.services.email_service import EmailService

router = APIRouter()


@router.post("/")
async def send_contact_message(
    message: ContactMessage,
    db: AsyncSession = Depends(get_db)
):
    """İletişim formu mesajı gönder"""
    email_service = EmailService()
    await email_service.send_contact_email(message)
    return {"message": "Message sent successfully"}


@router.get("/info")
async def get_contact_info():
    """Restoran iletişim bilgilerini getir"""
    return {
        "phone": "+90 XXX XXX XX XX",
        "email": "info@seyirtepe.com",
        "address": "Seyirtepe Mevkii, Amik Ovası, Hatay",
        "working_hours": {
            "weekdays": "10:00 - 23:00",
            "weekend": "09:00 - 00:00"
        }
    }
