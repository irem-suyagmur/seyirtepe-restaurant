import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
from app.schemas.contact import ContactMessage


class EmailService:
    async def send_contact_email(self, message: ContactMessage):
        """İletişim formu mesajını email olarak gönder"""
        if not settings.CONTACT_TO_EMAIL:
            raise RuntimeError("CONTACT_TO_EMAIL is not configured")

        # If SMTP isn't configured, fail fast so the API doesn't pretend success.
        if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            raise RuntimeError("SMTP credentials are not configured (SMTP_HOST/SMTP_USER/SMTP_PASSWORD)")

        msg = MIMEMultipart()
        msg['From'] = settings.EMAILS_FROM_EMAIL
        msg['To'] = settings.CONTACT_TO_EMAIL
        # Make it easy to reply to the user who filled the form
        msg['Reply-To'] = str(message.email)
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
        
        # Port 465 uses implicit TLS, 587 typically uses STARTTLS.
        use_tls = int(settings.SMTP_PORT) == 465
        start_tls = not use_tls

        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=use_tls,
            start_tls=start_tls,
        )
    
    async def send_reservation_confirmation(self, reservation_data: dict):
        """Rezervasyon onay emaili gönder"""
        # TODO: Implement reservation confirmation email
        pass
