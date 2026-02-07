from pydantic import BaseModel
from typing import Optional


class SiteSettingsResponse(BaseModel):
    logo_url: Optional[str] = None


class SiteLogoUploadResponse(BaseModel):
    logo_url: str
    storage: str
