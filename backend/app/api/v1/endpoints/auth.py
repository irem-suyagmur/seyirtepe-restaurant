from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.config import settings
from app.security import create_access_token, verify_password

router = APIRouter()


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


@router.post("/login", response_model=TokenResponse)
def admin_login(payload: AdminLoginRequest):
    email_ok = str(payload.email).strip().lower() == str(settings.ADMIN_EMAIL).strip().lower()

    password_ok = False
    if settings.ADMIN_PASSWORD_HASH:
        password_ok = verify_password(payload.password, settings.ADMIN_PASSWORD_HASH)
    else:
        # Fallback (dev only): plain password compare
        password_ok = bool(settings.ADMIN_PASSWORD) and payload.password == settings.ADMIN_PASSWORD

    if not (email_ok and password_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    minutes = int(settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(subject="admin", expires_minutes=minutes)
    return TokenResponse(access_token=token, expires_in=minutes * 60)
