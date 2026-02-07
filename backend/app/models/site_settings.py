from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


class SiteSettings(Base):
    __tablename__ = "site_settings"

    # Singleton row (we always use id=1)
    id = Column(Integer, primary_key=True, index=True)

    logo_url = Column(String, nullable=True)
    logo_storage = Column(String, nullable=True)  # "cloudinary" | "local" | None
    logo_public_id = Column(String, nullable=True)  # For Cloudinary deletes/overwrites

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
