from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import UserCreate, UserLogin, TokenResponse, TokenRefresh
from app.schemas.patient import PatientRegister
from app.schemas.doctor import DoctorCreate
from app.services.auth_service import AuthService
from app.models.user import UserRole
from app.core.config import settings
from app.api.deps.auth import get_current_active_user
from pydantic import BaseModel, EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

router = APIRouter()


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_patient(
    patient_data: PatientRegister,
    db: Session = Depends(get_db)
):
    """Register a new patient."""
    try:
        # Create user account
        user_create = UserCreate(
            email=patient_data.email,
            password=patient_data.password,
            role=UserRole.PATIENT
        )

        user = AuthService.create_user(db, user_create, UserRole.PATIENT)

        # Create patient profile
        from app.services.patient_service import PatientService
        patient = PatientService.create_patient(db, patient_data, user.id)

        return {
            "message": "Patient registered successfully",
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/register-doctor", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_doctor(
    doctor_data: DoctorCreate,
    db: Session = Depends(get_db)
):
    """Register a new doctor."""
    try:
        # Create user account
        user_create = UserCreate(
            email=doctor_data.email,
            password=doctor_data.password,
            role=UserRole.DOCTOR
        )

        user = AuthService.create_user(db, user_create, UserRole.DOCTOR)

        # Create doctor profile
        from app.services.doctor_service import DoctorService
        doctor = DoctorService.create_doctor(db, doctor_data)

        return {
            "message": "Doctor registered successfully",
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Login user."""
    try:
        result = AuthService.login_user(db, login_data)

        return TokenResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            user=result["user"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/refresh", response_model=dict)
async def refresh_token(
    token_data: TokenRefresh,
    db: Session = Depends(get_db)
):
    """Refresh access token."""
    try:
        access_token = AuthService.refresh_access_token(token_data.refresh_token)

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )


@router.post("/logout")
async def logout():
    """Logout user (client-side token removal)."""
    return {"message": "Logout successful"}


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """Send password reset email."""
    try:
        # Check if user exists
        user = AuthService.get_user_by_email(db, request.email)
        if not user:
            # Return success even if user doesn't exist for security
            return {"message": "If an account with this email exists, a password reset link has been sent."}

        # Generate reset token (simplified - in production, use proper token generation)
        reset_token = AuthService.generate_password_reset_token(user.id)

        # In a real application, you would send an email here
        # For demo purposes, we'll just return success
        print(f"Password reset token for {request.email}: {reset_token}")

        return {"message": "If an account with this email exists, a password reset link has been sent."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset request failed: {str(e)}"
        )


@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Change user password."""
    try:
        AuthService.change_password(db, str(current_user.id), current_password, new_password)

        return {"message": "Password changed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password change failed: {str(e)}"
        )