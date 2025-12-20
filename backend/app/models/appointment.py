from sqlalchemy import Column, String, Date, Time, Text, DateTime, ForeignKey, Enum as SQLEnum, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.db.database import Base


class AppointmentStatus(str, enum.Enum):
    SCHEDULED = "Scheduled"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class ConsultationType(str, enum.Enum):
    IN_PERSON = "In-Person"
    VIDEO = "Video"
    PHONE = "Phone"


class PaymentStatus(str, enum.Enum):
    PENDING = "Pending"
    PAID = "Paid"
    REFUNDED = "Refunded"


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    status = Column(SQLEnum(AppointmentStatus), default=AppointmentStatus.SCHEDULED)
    consultation_type = Column(SQLEnum(ConsultationType), default=ConsultationType.IN_PERSON)
    symptoms = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    consultation_fee = Column(DECIMAL(10, 2), nullable=True)
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")

    def __repr__(self):
        return f"<Appointment(id={self.id}, patient_id={self.patient_id}, doctor_id={self.doctor_id}, date={self.appointment_date})>"