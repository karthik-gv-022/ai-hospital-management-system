from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Time, DECIMAL, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import json
from app.db.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=False)
    specialization = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    license_number = Column(String(100), unique=True, nullable=False)
    experience_years = Column(Integer, default=0)
    consultation_fee = Column(DECIMAL(10, 2), nullable=False)
    available_days = Column(JSON, nullable=True)  # e.g., ["Monday", "Tuesday"]
    available_time_start = Column(Time, nullable=False)
    available_time_end = Column(Time, nullable=False)
    max_patients_per_day = Column(Integer, default=20)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    appointments = relationship("Appointment", back_populates="doctor")
    tokens = relationship("Token", back_populates="doctor")

    def __repr__(self):
        return f"<Doctor(id={self.id}, name={self.first_name} {self.last_name}, specialization={self.specialization})>"