from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel, Field
from app.models.token import TokenStatus


class TokenBase(BaseModel):
    doctor_id: str
    appointment_id: Optional[str] = None
    appointment_date: date


class TokenCreate(TokenBase):
    pass


class TokenResponse(TokenBase):
    id: str
    patient_id: str
    token_number: int
    status: TokenStatus
    estimated_wait_time: Optional[int] = None
    actual_wait_time: Optional[int] = None
    called_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Include related data
    patient: Optional[dict] = None
    doctor: Optional[dict] = None

    class Config:
        from_attributes = True


class TokenGeneration(BaseModel):
    doctor_id: str
    appointment_id: str


class TokenConfirmation(BaseModel):
    token_number: int
    estimated_wait_time: int
    queue_position: int


class TokenCall(BaseModel):
    token_number: int
    patient_details: dict


class TokenComplete(BaseModel):
    actual_wait_time: int
    notes: Optional[str] = None


class TokenDisplay(BaseModel):
    current_token: Optional[TokenResponse] = None
    queue_status: dict
    waiting_count: int
    average_wait_time: int


class TokenQueue(BaseModel):
    token_number: int
    patient_name: str
    estimated_wait_time: int
    status: TokenStatus