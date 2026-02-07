import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
from app.schemas.contact import ContactMessage


class EmailService:
    async def send_contact_email(self, message: ContactMessage):
        """İletişim formu mesajını email olarak gönder"""
        msg = MIMEMultipart()
        msg['From'] = settings.EMAILS_FROM_EMAIL
        msg['To'] = settings.EMAILS_FROM_EMAIL
        msg['Subject'] = f"İletişim Formu: {message.subject}"
        
        body = f"""
        Yeni İletişim Formu Mesajı
        
        İsim: {message.name}
        Email: {message.email}
        Telefon: {message.phone}
        Konu: {message.subject}
        
        Mesaj:
        {message.message}
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        try:
            await aiosmtplib.send(
                msg,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                use_tls=True
            )
        except Exception as e:
            print(f"Email gönderme hatası: {e}")
            # Production'da proper error handling
            pass
    
    async def send_reservation_confirmation(self, reservation_data: dict):
        """Rezervasyon onay emaili gönder"""
        # TODO: Implement reservation confirmation email
        pass
