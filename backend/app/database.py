from sqlalchemy import create_engine, text
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

    # Production hardening (PostgreSQL): make sure enum values exist and normalize
    # any legacy uppercase enum rows to lowercase values.
    if engine.dialect.name == "postgresql":
        # 1) Ensure enum values exist (ALTER TYPE must run in autocommit mode)
        enum_values = {
            "reservationstatus": ["pending", "confirmed", "cancelled", "completed"],
            "orderstatus": ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"],
        }
        with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
            for enum_name, values in enum_values.items():
                for val in values:
                    try:
                        conn.execute(text(f"ALTER TYPE {enum_name} ADD VALUE IF NOT EXISTS '{val}'"))
                    except Exception:
                        # If the type doesn't exist yet or the DB doesn't support IF NOT EXISTS,
                        # we'll rely on create_all / migrations and continue.
                        pass

        # 2) Normalize legacy uppercase rows if present
        with engine.begin() as conn:
            try:
                conn.execute(text("UPDATE reservations SET status = LOWER(status::text) WHERE status IS NOT NULL"))
            except Exception:
                pass
            try:
                conn.execute(text("UPDATE orders SET status = LOWER(status::text) WHERE status IS NOT NULL"))
            except Exception:
                pass
