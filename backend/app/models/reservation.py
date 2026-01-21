from sqlalchemy import Column, Integer, String, DateTime, Text, Enum
from datetime import datetime
import enum
from app.database import Base


class ReservationStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Reservation(Base):
    __tablename__ = "reservations"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=True)
    customer_phone = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    guests = Column(Integer, nullable=False)
    special_requests = Column(Text)
    # Store enum VALUES ("pending") rather than NAMES ("PENDING") to avoid
    # Postgres enum mismatches when the DB was created/migrated with lowercase values.
    status = Column(
        Enum(
            ReservationStatus,
            name="reservationstatus",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        default=ReservationStatus.PENDING,
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
