from sqlalchemy import Column, String, Date, Time, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.db.database import Base


class TokenStatus(str, enum.Enum):
    WAITING = "Waiting"
    CALLED = "Called"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class Token(Base):
    __tablename__ = "tokens"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    token_number = Column(Integer, nullable=False)
    appointment_date = Column(Date, nullable=False)
    status = Column(SQLEnum(TokenStatus), default=TokenStatus.WAITING)
    estimated_wait_time = Column(Integer, nullable=True)  # in minutes
    actual_wait_time = Column(Integer, nullable=True)  # in minutes
    called_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="tokens")
    doctor = relationship("Doctor", back_populates="tokens")

    def __repr__(self):
        return f"<Token(id={self.id}, token_number={self.token_number}, patient_id={self.patient_id}, doctor_id={self.doctor_id})>"