from typing import Optional
from datetime import datetime, date, time
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.appointment import AppointmentStatus, ConsultationType, PaymentStatus


class AppointmentBase(BaseModel):
    doctor_id: str
    appointment_date: date
    appointment_time: time
    consultation_type: ConsultationType = ConsultationType.IN_PERSON
    symptoms: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None
    consultation_type: Optional[ConsultationType] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[AppointmentStatus] = None
    consultation_fee: Optional[Decimal] = None
    payment_status: Optional[PaymentStatus] = None


class AppointmentResponse(AppointmentBase):
    id: str
    patient_id: str
    status: AppointmentStatus
    notes: Optional[str] = None
    consultation_fee: Optional[Decimal] = None
    payment_status: PaymentStatus
    created_at: datetime
    updated_at: datetime

    # Include related data
    patient: Optional[dict] = None
    doctor: Optional[dict] = None

    class Config:
        from_attributes = True


class AppointmentBooking(BaseModel):
    doctor_id: str
    preferred_date: date
    preferred_time: time
    consultation_type: ConsultationType = ConsultationType.IN_PERSON
    symptoms: Optional[str] = None


class AppointmentConfirmation(BaseModel):
    appointment_id: str
    token_number: Optional[int] = None
    estimated_wait_time: Optional[int] = None
    confirmation_details: str


class AppointmentFilter(BaseModel):
    status: Optional[AppointmentStatus] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    doctor_id: Optional[str] = None