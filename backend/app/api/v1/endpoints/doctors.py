from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date
from app.db.database import get_db
from app.schemas.doctor import DoctorResponse, DoctorList, DoctorProfile, DoctorAvailability
from app.services.doctor_service import DoctorService
from app.api.deps.auth import get_current_active_user, get_current_doctor, get_current_admin
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[DoctorList])
async def get_doctors(
    specialization: Optional[str] = Query(None, description="Filter by specialization"),
    department: Optional[str] = Query(None, description="Filter by department"),
    available_today: Optional[bool] = Query(None, description="Filter by availability today"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get list of doctors with optional filtering."""
    try:
        doctors = DoctorService.get_doctors(
            db=db,
            skip=skip,
            limit=limit,
            specialization=specialization,
            department=department,
            available_today=available_today
        )

        # Convert to DoctorList format
        result = []
        for doctor in doctors:
            doctor_list = DoctorList(
                id=str(doctor.id),
                first_name=doctor.first_name,
                last_name=doctor.last_name,
                specialization=doctor.specialization,
                department=doctor.department,
                consultation_fee=doctor.consultation_fee,
                is_active=doctor.is_active
            )
            result.append(doctor_list)

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get doctors: {str(e)}"
        )


@router.get("/{doctor_id}", response_model=DoctorResponse)
async def get_doctor_details(
    doctor_id: str,
    db: Session = Depends(get_db)
):
    """Get doctor details by ID."""
    try:
        doctor = DoctorService.get_doctor_by_id(db, doctor_id)
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        return doctor

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get doctor details: {str(e)}"
        )


@router.get("/{doctor_id}/appointments")
async def get_doctor_appointments(
    doctor_id: str,
    appointment_date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get doctor's appointments."""
    try:
        # Check permissions: doctor can only see own appointments, admin can see all
        if current_user.role.value == "doctor":
            doctor = DoctorService.get_doctor_by_user_id(db, str(current_user.id))
            if not doctor or str(doctor.id) != doctor_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view these appointments"
                )
        elif current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view doctor appointments"
            )

        # Parse date if provided
        parsed_date = None
        if appointment_date:
            try:
                parsed_date = date.fromisoformat(appointment_date)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date format. Use YYYY-MM-DD"
                )

        appointments = DoctorService.get_doctor_appointments(
            db=db,
            doctor_id=doctor_id,
            appointment_date=parsed_date,
            status=status
        )

        # Convert to dict format for response
        result = []
        for appointment in appointments:
            appointment_dict = {
                "id": str(appointment.id),
                "patient_id": str(appointment.patient_id),
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
                "patient": {
                    "id": str(appointment.patient.id),
                    "first_name": appointment.patient.first_name,
                    "last_name": appointment.patient.last_name,
                    "phone": appointment.patient.phone,
                    "email": appointment.patient.email
                } if appointment.patient else None
            }
            result.append(appointment_dict)

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get doctor appointments: {str(e)}"
        )


@router.put("/{doctor_id}/availability")
async def update_doctor_availability(
    doctor_id: str,
    availability: DoctorAvailability,
    current_user: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    """Update doctor availability."""
    try:
        # Check if doctor is updating their own availability
        doctor = DoctorService.get_doctor_by_user_id(db, str(current_user.id))
        if not doctor or str(doctor.id) != doctor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this doctor's availability"
            )

        updated_doctor = DoctorService.update_doctor_availability(
            db=db,
            doctor_id=doctor_id,
            available_days=availability.available_days,
            available_time_start=availability.available_time_start,
            available_time_end=availability.available_time_end,
            max_patients_per_day=availability.max_patients_per_day
        )

        return {
            "message": "Doctor availability updated successfully",
            "availability": {
                "available_days": updated_doctor.available_days,
                "available_time_start": updated_doctor.available_time_start.strftime("%H:%M"),
                "available_time_end": updated_doctor.available_time_end.strftime("%H:%M"),
                "max_patients_per_day": updated_doctor.max_patients_per_day
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update doctor availability: {str(e)}"
        )


@router.get("/{doctor_id}/availability/{target_date}")
async def get_doctor_availability(
    doctor_id: str,
    target_date: str,
    db: Session = Depends(get_db)
):
    """Get doctor's availability for a specific date."""
    try:
        # Parse date
        try:
            parsed_date = date.fromisoformat(target_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )

        availability = DoctorService.get_doctor_availability(db, doctor_id, parsed_date)
        return availability

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get doctor availability: {str(e)}"
        )


@router.get("/profile/me", response_model=DoctorProfile)
async def get_my_doctor_profile(
    current_user: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    """Get current doctor's profile."""
    try:
        doctor = DoctorService.get_doctor_by_user_id(db, str(current_user.id))
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found"
            )

        # Get additional statistics
        from app.models.appointment import Appointment

        total_appointments = db.query(Appointment).filter(
            Appointment.doctor_id == doctor.id
        ).count()

        from datetime import date
        today_appointments = db.query(Appointment).filter(
            Appointment.doctor_id == doctor.id,
            Appointment.appointment_date == date.today(),
            Appointment.status.in_(["Scheduled", "In Progress"])
        ).count()

        return DoctorProfile(
            **doctor.__dict__,
            total_appointments=total_appointments,
            today_appointments=today_appointments
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get doctor profile: {str(e)}"
        )


# Admin endpoints for doctor management
@router.post("/", response_model=DoctorResponse)
async def create_doctor(
    doctor_data: dict,  # Will use DoctorCreate schema when implemented
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new doctor (Admin only)."""
    try:
        from app.schemas.doctor import DoctorCreate
        from app.services.auth_service import AuthService
        from app.models.user import UserRole

        # Extract doctor data and password
        doctor_create_data = DoctorCreate(**doctor_data)
        password = doctor_data.get("password", "doctor123")  # Default password

        # Create user account
        user_create = {
            "email": doctor_create_data.email,
            "password": password,
            "role": UserRole.DOCTOR
        }
        AuthService.create_user(db, user_create, UserRole.DOCTOR)

        # Create doctor profile
        doctor = DoctorService.create_doctor(db, doctor_create_data)

        return doctor

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create doctor: {str(e)}"
        )