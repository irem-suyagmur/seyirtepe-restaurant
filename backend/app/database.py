from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings

# Database engine - PostgreSQL veya SQLite
# check_same_thread sadece SQLite için gerekli
connect_args = {}
if "sqlite" in settings.DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args=connect_args,
    echo=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Session:
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Veritabanını başlat ve tabloları oluştur"""
    # Ensure all models are imported so SQLAlchemy registers tables/enums
    # before running create_all (prevents missing-table issues on fresh DBs).
    from app import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
