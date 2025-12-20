from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date
from app.db.database import get_db
from app.schemas.token import (
    TokenResponse, TokenCreate, TokenConfirmation, TokenCall,
    TokenComplete, TokenDisplay, TokenQueue
)
from app.services.token_service import TokenService
from app.services.patient_service import PatientService
from app.api.deps.auth import get_current_patient, get_current_doctor, get_current_admin, get_current_active_user
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=TokenResponse)
async def generate_token(
    token_data: TokenCreate,
    current_user: User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Generate a new token for a patient."""
    try:
        # Get patient profile
        patient = PatientService.get_patient_by_user_id(db, str(current_user.id))
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found"
            )

        # Validate token date (should be today or future)
        if token_data.appointment_date < date.today():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot generate token for past dates"
            )

        token = TokenService.generate_token(db, token_data, str(patient.id))

        return token

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate token: {str(e)}"
        )


@router.post("/quick-generate", response_model=TokenConfirmation)
async def quick_generate_token(
    doctor_id: str,
    appointment_id: Optional[str] = None,
    current_user: User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Quick token generation for today's appointment."""
    try:
        # Get patient profile
        patient = PatientService.get_patient_by_user_id(db, str(current_user.id))
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found"
            )

        # Create token for today
        token_data = TokenCreate(
            doctor_id=doctor_id,
            appointment_id=appointment_id,
            appointment_date=date.today()
        )

        token = TokenService.generate_token(db, token_data, str(patient.id))

        # Get queue position
        queue = TokenService.get_token_queue(db, doctor_id)
        queue_position = next((i + 1 for i, t in enumerate(queue) if str(t.id) == str(token.id)), 0)

        return TokenConfirmation(
            token_number=token.token_number,
            estimated_wait_time=token.estimated_wait_time,
            queue_position=queue_position
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate token: {str(e)}"
        )


@router.get("/current", response_model=TokenDisplay)
async def get_current_token_display(
    doctor_id: Optional[str] = Query(None, description="Filter by doctor ID"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current token display (for doctor/admin)."""
    try:
        # Check authorization
        if current_user.role.value == "doctor":
            from app.services.doctor_service import DoctorService
            doctor = DoctorService.get_doctor_by_user_id(db, str(current_user.id))
            if not doctor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Doctor profile not found"
                )
            doctor_id = str(doctor.id)
        elif current_user.role.value == "admin":
            if not doctor_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="doctor_id is required for admin users"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view token display"
            )

        display_data = TokenService.get_token_display(db, doctor_id)

        return TokenDisplay(
            current_token=display_data["current_token"],
            queue_status=display_data["queue_status"],
            waiting_count=display_data["queue_status"]["waiting_count"],
            average_wait_time=display_data["average_wait_time"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get token display: {str(e)}"
        )


@router.get("/queue", response_model=List[TokenQueue])
async def get_token_queue(
    doctor_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get token queue for a doctor."""
    try:
        # Check authorization
        if current_user.role.value == "doctor":
            from app.services.doctor_service import DoctorService
            doctor = DoctorService.get_doctor_by_user_id(db, str(current_user.id))
            if not doctor or str(doctor.id) != doctor_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view this queue"
                )
        elif current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view token queue"
            )

        queue_tokens = TokenService.get_token_queue(db, doctor_id)

        result = []
        for token in queue_tokens:
            patient_name = f"{token.patient.first_name} {token.patient.last_name}"
            token_queue = TokenQueue(
                token_number=token.token_number,
                patient_name=patient_name,
                estimated_wait_time=token.estimated_wait_time,
                status=token.status
            )
            result.append(token_queue)

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get token queue: {str(e)}"
        )


@router.put("/{token_id}/call", response_model=TokenCall)
async def call_token(
    token_id: str,
    current_user: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    """Call the next token in queue."""
    try:
        # Verify doctor is calling their own token
        from app.services.doctor_service import DoctorService
        doctor = DoctorService.get_doctor_by_user_id(db, str(current_user.id))
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found"
            )

        token = TokenService.get_token_by_id(db, token_id)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Token not found"
            )

        if str(token.doctor_id) != str(doctor.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to call this token"
            )

        called_token = TokenService.call_token(db, token_id)

        patient_details = {
            "id": str(called_token.patient.id),
            "name": f"{called_token.patient.first_name} {called_token.patient.last_name}",
            "phone": called_token.patient.phone,
            "symptoms": None  # Will be populated from appointment if exists
        }

        # Get symptoms from appointment if exists
        from app.models.appointment import Appointment
        appointment = db.query(Appointment).filter(
            Appointment.patient_id == called_token.patient_id,
            Appointment.doctor_id == called_token.doctor_id,
            Appointment.appointment_date == called_token.appointment_date
        ).first()

        if appointment:
            patient_details["symptoms"] = appointment.symptoms

        return TokenCall(
            token_number=called_token.token_number,
            patient_details=patient_details
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to call token: {str(e)}"
        )


@router.put("/{token_id}/complete")
async def complete_token(
    token_id: str,
    completion_data: TokenComplete,
    current_user: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    """Mark a token as completed."""
    try:
        # Verify doctor is completing their own token
        from app.services.doctor_service import DoctorService
        doctor = DoctorService.get_doctor_by_user_id(db, str(current_user.id))
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found"
            )

        token = TokenService.get_token_by_id(db, token_id)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Token not found"
            )

        if str(token.doctor_id) != str(doctor.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to complete this token"
            )

        completed_token = TokenService.complete_token(
            db, token_id, completion_data.actual_wait_time, completion_data.notes
        )

        # Update wait times for remaining tokens
        TokenService.update_wait_times(db, str(doctor.id))

        return {
            "message": "Token completed successfully",
            "token_number": completed_token.token_number,
            "actual_wait_time": completed_token.actual_wait_time
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete token: {str(e)}"
        )


@router.get("/my/tokens", response_model=List[TokenResponse])
async def get_my_tokens(
    status: Optional[str] = Query(None, description="Filter by token status"),
    current_user: User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Get current patient's tokens."""
    try:
        patient = PatientService.get_patient_by_user_id(db, str(current_user.id))
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found"
            )

        # Parse status filter
        status_filter = None
        if status:
            from app.models.token import TokenStatus
            try:
                status_filter = TokenStatus(status)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status. Valid values: {[s.value for s in TokenStatus]}"
                )

        tokens = TokenService.get_patient_tokens(db, str(patient.id), status_filter)
        return tokens

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get patient tokens: {str(e)}"
        )


@router.get("/summary/daily")
async def get_daily_token_summary(
    doctor_id: str,
    target_date: str = Query(..., description="Date for summary (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get daily token summary for a doctor."""
    try:
        # Check authorization
        if current_user.role.value == "doctor":
            from app.services.doctor_service import DoctorService
            doctor = DoctorService.get_doctor_by_user_id(db, str(current_user.id))
            if not doctor or str(doctor.id) != doctor_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view this summary"
                )
        elif current_user.role.value != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view token summary"
            )

        # Parse date
        try:
            parsed_date = date.fromisoformat(target_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )

        summary = TokenService.get_daily_token_summary(db, doctor_id, parsed_date)
        return summary

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get daily token summary: {str(e)}"
        )