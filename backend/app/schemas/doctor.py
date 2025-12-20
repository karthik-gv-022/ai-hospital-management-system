from typing import Optional, List
from datetime import datetime, time
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field
from app.models.doctor import Doctor


class DoctorBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    specialization: str = Field(..., min_length=1, max_length=100)
    department: str = Field(..., min_length=1, max_length=100)
    license_number: str = Field(..., min_length=1, max_length=100)
    experience_years: int = Field(default=0, ge=0)
    consultation_fee: Decimal = Field(..., gt=0)
    available_days: Optional[List[str]] = []
    available_time_start: time
    available_time_end: time
    max_patients_per_day: int = Field(default=20, gt=0)


class DoctorCreate(DoctorBase):
    password: str = Field(..., min_length=8)


class DoctorUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    specialization: Optional[str] = Field(None, min_length=1, max_length=100)
    department: Optional[str] = Field(None, min_length=1, max_length=100)
    experience_years: Optional[int] = Field(None, ge=0)
    consultation_fee: Optional[Decimal] = Field(None, gt=0)
    available_days: Optional[List[str]] = None
    available_time_start: Optional[time] = None
    available_time_end: Optional[time] = None
    max_patients_per_day: Optional[int] = Field(None, gt=0)


class DoctorResponse(DoctorBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DoctorList(BaseModel):
    id: str
    first_name: str
    last_name: str
    specialization: str
    department: str
    consultation_fee: Decimal
    is_active: bool

    class Config:
        from_attributes = True


class DoctorAvailability(BaseModel):
    doctor_id: str
    available_days: List[str]
    available_time_start: time
    available_time_end: time
    max_patients_per_day: int
    current_patients_today: int  # Number of patients scheduled for today


class DoctorProfile(DoctorResponse):
    # Include additional statistics when needed
    total_appointments: Optional[int] = 0
    today_appointments: Optional[int] = 0
    average_rating: Optional[Decimal] = None
    total_revenue: Optional[Decimal] = None