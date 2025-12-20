from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.patient import PatientResponse, PatientUpdate, PatientProfile
from app.services.patient_service import PatientService
from app.api.deps.auth import get_current_patient, get_current_admin
from app.models.user import User

router = APIRouter()


@router.get("/profile", response_model=PatientProfile)
async def get_patient_profile(
    current_user: User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Get current patient's profile."""
    try:
        patient = PatientService.get_patient_by_user_id(db, str(current_user.id))
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found"
            )

        # Get additional statistics
        from app.models.appointment import Appointment

        total_appointments = db.query(Appointment).filter(
            Appointment.patient_id == patient.id
        ).count()

        upcoming_appointments = db.query(Appointment).filter(
            Appointment.patient_id == patient.id,
            Appointment.status.in_(["Scheduled", "In Progress"])
        ).count()

        return PatientProfile(
            **patient.__dict__,
            total_appointments=total_appointments,
            upcoming_appointments=upcoming_appointments
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get patient profile: {str(e)}"
        )


@router.put("/profile", response_model=PatientResponse)
async def update_patient_profile(
    patient_data: PatientUpdate,
    current_user: User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Update current patient's profile."""
    try:
        patient = PatientService.get_patient_by_user_id(db, str(current_user.id))
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found"
            )

        updated_patient = PatientService.update_patient(db, str(patient.id), patient_data)
        return updated_patient

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update patient profile: {str(e)}"
        )


@router.get("/appointments", response_model=List[dict])
async def get_patient_appointments(
    status: Optional[str] = Query(None, description="Filter by appointment status"),
    date_from: Optional[str] = Query(None, description="Filter appointments from date"),
    date_to: Optional[str] = Query(None, description="Filter appointments to date"),
    current_user: User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Get current patient's appointments."""
    try:
        patient = PatientService.get_patient_by_user_id(db, str(current_user.id))
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found"
            )

        from app.models.appointment import Appointment
        from datetime import datetime

        query = db.query(Appointment).filter(Appointment.patient_id == patient.id)

        # Apply filters
        if status:
            query = query.filter(Appointment.status == status)

        if date_from:
            try:
                date_from_obj = datetime.strptime(date_from, "%Y-%m-%d").date()
                query = query.filter(Appointment.appointment_date >= date_from_obj)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date_from format. Use YYYY-MM-DD"
                )

        if date_to:
            try:
                date_to_obj = datetime.strptime(date_to, "%Y-%m-%d").date()
                query = query.filter(Appointment.appointment_date <= date_to_obj)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date_to format. Use YYYY-MM-DD"
                )

        # Order by appointment date and time
        appointments = query.order_by(
            Appointment.appointment_date.desc(),
            Appointment.appointment_time.desc()
        ).all()

        # Convert to dict format for response
        result = []
        for appointment in appointments:
            appointment_dict = {
                "id": str(appointment.id),
                "doctor_id": str(appointment.doctor_id),
                "appointment_date": appointment.appointment_date.isoformat(),
                "appointment_time": appointment.appointment_time.isoformat(),
                "status": appointment.status,
                "consultation_type": appointment.consultation_type,
                "symptoms": appointment.symptoms,
                "notes": appointment.notes,
                "consultation_fee": float(appointment.consultation_fee) if appointment.consultation_fee else None,
                "payment_status": appointment.payment_status,
                "created_at": appointment.created_at.isoformat(),
                "updated_at": appointment.updated_at.isoformat(),
                "doctor": {
                    "id": str(appointment.doctor.id),
                    "first_name": appointment.doctor.first_name,
                    "last_name": appointment.doctor.last_name,
                    "specialization": appointment.doctor.specialization,
                    "department": appointment.doctor.department
                } if appointment.doctor else None
            }
            result.append(appointment_dict)

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get patient appointments: {str(e)}"
        )


# Admin endpoints for patient management
@router.get("/", response_model=List[PatientResponse])
async def get_all_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all patients (Admin only)."""
    try:
        patients = PatientService.get_patients_paginated(db, skip, limit, search)
        return patients

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get patients: {str(e)}"
        )


@router.get("/count")
async def get_patients_count(
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get total count of patients (Admin only)."""
    try:
        count = PatientService.get_patients_count(db, search)
        return {"count": count}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get patients count: {str(e)}"
        )