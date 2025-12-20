from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field
from app.models.patient import Gender, BloodGroup


class PatientBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    date_of_birth: date
    gender: Gender
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_group: Optional[BloodGroup] = None


class PatientCreate(PatientBase):
    password: str = Field(..., min_length=8)


class PatientRegister(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    date_of_birth: date
    gender: Gender
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_group: Optional[BloodGroup] = None
    password: str = Field(..., min_length=8)


class PatientUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_group: Optional[BloodGroup] = None


class PatientResponse(PatientBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PatientProfile(PatientResponse):
    # Include additional statistics when needed
    total_appointments: Optional[int] = 0
    upcoming_appointments: Optional[int] = 0