from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date, time
from app.db.database import get_db
from app.schemas.appointment import (
    AppointmentResponse, AppointmentCreate, AppointmentUpdate,
    AppointmentBooking, AppointmentConfirmation
)
from app.services.appointment_service import AppointmentService
from app.services.patient_service import PatientService
from app.api.deps.auth import get_current_patient, get_current_doctor, get_current_admin, get_current_active_user
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=AppointmentResponse)
async def book_appointment(
    booking_data: AppointmentBooking,
    current_user: User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Book a new appointment."""
    try:
        # Get patient profile
        patient = PatientService.get_patient_by_user_id(db, str(current_user.id))
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found"
            )

        # Create appointment data
        appointment_data = AppointmentCreate(
            doctor_id=booking_data.doctor_id,
            appointment_date=booking_data.preferred_date,
            appointment_time=booking_data.preferred_time,
            consultation_type=booking_data.consultation_type,
            symptoms=booking_data.symptoms
        )

        appointment = AppointmentService.create_appointment(db, appointment_data, str(patient.id))

        return appointment

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to book appointment: {str(e)}"
        )


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment_details(
    appointment_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get appointment details."""
    try:
        appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )

        # Check authorization
        if current_user.role.value == "patient":
            patient = PatientService.get_patient_by_user_id(db, str(current_user.id))
            if not patient or str(patient.id) != str(appointment.patient_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view this appointment"
                )
        elif current_user.role.value == "doctor":
            from app.services.doctor_service import DoctorService
            doctor = DoctorService.get_doctor_by_user_id(db, str(current_user.id))
            if not doctor or str(doctor.id) != str(appointment.doctor_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view this appointment"
                )
        # Admin can view any appointment

        return appointment

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get appointment details: {str(e)}"
        )


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: str,
    appointment_data: AppointmentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update appointment."""
    try:
        # Verify appointment exists and user has access
        appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )

        # Check authorization and get user context
        user_context = None
        if current_user.role.value == "patient":
            patient = PatientService.get_patient_by_user_id(db, str(current_user.id))
            if not patient or str(patient.id) != str(appointment.patient_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to update this appointment"
                )
            user_context = str(patient.id)
        elif current_user.role.value == "doctor":
            from app.services.doctor_service import DoctorService
            doctor = DoctorService.get_doctor_by_user_id(db, str(current_user.id))
            if not doctor or str(doctor.id) != str(appointment.doctor_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to update this appointment"
                )
            user_context = str(doctor.id)

        updated_appointment = AppointmentService.update_appointment(
            db, appointment_id, appointment_data, current_user.role.value, user_context
        )

        return updated_appointment

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update appointment: {str(e)}"
        )


@router.delete("/{appointment_id}")
async def cancel_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel appointment."""
    try:
        # Verify appointment exists and user has access
        appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )

        # Check authorization and get user context
        user_context = None
        if current_user.role.value == "patient":
            patient = PatientService.get_patient_by_user_id(db, str(current_user.id))
            if not patient or str(patient.id) != str(appointment.patient_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to cancel this appointment"
                )
            user_context = str(patient.id)
        elif current_user.role.value == "doctor":
            from app.services.doctor_service import DoctorService
            doctor = DoctorService.get_doctor_by_user_id(db, str(current_user.id))
            if not doctor or str(doctor.id) != str(appointment.doctor_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to cancel this appointment"
                )
            user_context = str(doctor.id)

        cancelled_appointment = AppointmentService.cancel_appointment(
            db, appointment_id, current_user.role.value, user_context
        )

        return {
            "message": "Appointment cancelled successfully",
            "appointment_id": str(cancelled_appointment.id),
            "refund_info": "Refund will be processed within 5-7 business days" if cancelled_appointment.consultation_fee else None
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel appointment: {str(e)}"
        )


@router.get("/my/upcoming", response_model=List[AppointmentResponse])
async def get_my_upcoming_appointments(
    days: int = Query(7, ge=1, le=30, description="Number of days to look ahead"),
    current_user: User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Get current patient's upcoming appointments."""
    try:
        patient = PatientService.get_patient_by_user_id(db, str(current_user.id))
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found"
            )

        appointments = AppointmentService.get_upcoming_appointments(db, str(patient.id), days)
        return appointments

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get upcoming appointments: {str(e)}"
        )


@router.get("/doctor/today", response_model=List[AppointmentResponse])
async def get_today_appointments(
    current_user: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    """Get current doctor's appointments for today."""
    try:
        from app.services.doctor_service import DoctorService
        doctor = DoctorService.get_doctor_by_user_id(db, str(current_user.id))
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found"
            )

        appointments = AppointmentService.get_today_appointments(db, str(doctor.id))
        return appointments

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get today's appointments: {str(e)}"
        )


@router.get("/all", response_model=List[AppointmentResponse])
async def get_all_appointments(
    date_from: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    status: Optional[str] = Query(None, description="Filter by status"),
    doctor_id: Optional[str] = Query(None, description="Filter by doctor ID"),
    patient_id: Optional[str] = Query(None, description="Filter by patient ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all appointments (Admin only)."""
    try:
        from app.models.appointment import Appointment, AppointmentStatus

        query = db.query(Appointment)

        # Apply filters
        if date_from:
            try:
                from_date = date.fromisoformat(date_from)
                query = query.filter(Appointment.appointment_date >= from_date)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date_from format. Use YYYY-MM-DD"
                )

        if date_to:
            try:
                to_date = date.fromisoformat(date_to)
                query = query.filter(Appointment.appointment_date <= to_date)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date_to format. Use YYYY-MM-DD"
                )

        if status:
            try:
                status_enum = AppointmentStatus(status)
                query = query.filter(Appointment.status == status_enum)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status. Valid values: {[s.value for s in AppointmentStatus]}"
                )

        if doctor_id:
            query = query.filter(Appointment.doctor_id == doctor_id)

        if patient_id:
            query = query.filter(Appointment.patient_id == patient_id)

        # Order and paginate
        appointments = query.order_by(
            Appointment.appointment_date.desc(),
            Appointment.appointment_time.desc()
        ).offset(skip).limit(limit).all()

        return appointments

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get appointments: {str(e)}"
        )