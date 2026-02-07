from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.site_settings import SiteSettings


class SiteSettingsService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create(self) -> SiteSettings:
        settings = self.db.query(SiteSettings).filter(SiteSettings.id == 1).first()
        if settings:
            return settings

        settings = SiteSettings(id=1, logo_url=None, logo_storage=None, logo_public_id=None)
        self.db.add(settings)
        self.db.commit()
        self.db.refresh(settings)
        return settings

    def set_logo(self, *, logo_url: str, storage: str | None = None, public_id: str | None = None) -> SiteSettings:
        settings = self.get_or_create()
        settings.logo_url = logo_url
        settings.logo_storage = storage
        settings.logo_public_id = public_id
        self.db.add(settings)
        self.db.commit()
        self.db.refresh(settings)
        return settings

    def clear_logo(self) -> SiteSettings:
        settings = self.get_or_create()
        settings.logo_url = None
        settings.logo_storage = None
        settings.logo_public_id = None
        self.db.add(settings)
        self.db.commit()
        self.db.refresh(settings)
        return settings
