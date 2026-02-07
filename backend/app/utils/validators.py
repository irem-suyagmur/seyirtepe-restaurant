from typing import Any
import re


def validate_phone(phone: str) -> bool:
    """Telefon numarası validasyonu"""
    pattern = r'^\+?1?\d{9,15}$'
    return bool(re.match(pattern, phone))


def validate_email(email: str) -> bool:
    """Email validasyonu"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
