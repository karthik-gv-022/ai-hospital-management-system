"""AI and ML prediction endpoints."""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date
from pydantic import BaseModel, Field

from app.db.database import get_db
from app.services.ai_service import ai_service
from app.api.deps.auth import get_current_active_user, get_current_admin
from app.models.user import User

router = APIRouter()


class DoctorRecommendationRequest(BaseModel):
    symptoms: str = Field(..., min_length=5, description="Patient symptoms description")
    preferred_date: date = Field(..., description="Preferred appointment date")
    preferred_specialization: Optional[str] = Field(None, description="Preferred doctor specialization")
    limit: int = Field(5, ge=1, le=10, description="Maximum number of recommendations")


class WaitTimePredictionRequest(BaseModel):
    doctor_id: str = Field(..., description="Doctor ID")
    appointment_date: date = Field(..., description="Appointment date")
    appointment_time: str = Field(..., pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$", description="Appointment time (HH:MM:SS)")


class SchedulingInsightsRequest(BaseModel):
    doctor_id: Optional[str] = Field(None, description="Doctor ID (optional)")
    date_range: int = Field(30, ge=7, le=365, description="Number of days to analyze")


# Initialize AI service on module import
try:
    ai_service.initialize_models()
except Exception as e:
    print(f"Warning: Failed to initialize AI models: {str(e)}")


@router.post("/recommend-doctor")
async def recommend_doctor(
    request: DoctorRecommendationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """AI-powered doctor recommendations based on symptoms and preferences."""
    try:
        # Only patients can get doctor recommendations
        if current_user.role.value != "patient":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can get doctor recommendations"
            )

        recommendations = ai_service.recommend_doctors(
            db=db,
            patient_symptoms=request.symptoms,
            preferred_date=request.preferred_date,
            preferred_specialization=request.preferred_specialization,
            limit=request.limit
        )

        return {
            "success": True,
            "data": recommendations,
            "request_info": {
                "symptoms": request.symptoms,
                "preferred_date": request.preferred_date.isoformat(),
                "preferred_specialization": request.preferred_specialization
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate doctor recommendations: {str(e)}"
        )


@router.post("/predict-wait-time")
async def predict_wait_time(
    request: WaitTimePredictionRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Predict wait time for a specific appointment."""
    try:
        # Validate doctor exists
        from app.models.doctor import Doctor
        doctor = db.query(Doctor).filter(Doctor.id == request.doctor_id).first()
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        prediction = ai_service.predict_wait_time(
            db=db,
            doctor_id=request.doctor_id,
            appointment_date=request.appointment_date,
            appointment_time=request.appointment_time
        )

        return {
            "success": True,
            "data": prediction,
            "request_info": {
                "doctor_id": request.doctor_id,
                "doctor_name": f"{doctor.first_name} {doctor.last_name}",
                "appointment_date": request.appointment_date.isoformat(),
                "appointment_time": request.appointment_time
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to predict wait time: {str(e)}"
        )


@router.post("/scheduling-optimization")
async def get_scheduling_insights(
    request: SchedulingInsightsRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered scheduling insights and optimization suggestions."""
    try:
        # Check authorization
        if current_user.role.value == "patient":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Patients cannot access scheduling analytics"
            )

        # Validate doctor if specified
        if request.doctor_id:
            if current_user.role.value == "doctor":
                # Doctors can only see their own insights
                from app.services.doctor_service import DoctorService
                doctor = DoctorService.get_doctor_by_user_id(db, str(current_user.id))
                if not doctor or str(doctor.id) != request.doctor_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Doctors can only access their own scheduling insights"
                    )
            # Admin can access any doctor's insights

        insights = ai_service.get_scheduling_insights(
            db=db,
            doctor_id=request.doctor_id,
            date_range=request.date_range
        )

        return {
            "success": True,
            "data": insights,
            "request_info": {
                "doctor_id": request.doctor_id,
                "date_range": request.date_range,
                "requested_by": current_user.role.value
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate scheduling insights: {str(e)}"
        )


@router.get("/model-status")
async def get_model_status(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get status of AI models (Admin only)."""
    try:
        doctor_model_status = {
            "is_trained": ai_service.doctor_allocation_model.is_trained,
            "model_type": "GradientBoostingClassifier",
            "purpose": "Doctor allocation recommendations"
        }

        scheduling_model_status = {
            "is_trained": ai_service.scheduling_model.is_trained,
            "model_type": "RandomForestRegressor",
            "purpose": "Wait time prediction and scheduling optimization"
        }

        # Get data availability
        from app.models.appointment import Appointment
        total_appointments = db.query(Appointment).count()

        return {
            "success": True,
            "models": {
                "doctor_allocation": doctor_model_status,
                "scheduling_optimization": scheduling_model_status
            },
            "data_availability": {
                "total_appointments": total_appointments,
                "sufficient_for_training": total_appointments >= 50
            },
            "system_status": {
                "models_loaded": ai_service.models_loaded,
                "feature_engineer_ready": ai_service.feature_engineer.is_fitted
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model status: {str(e)}"
        )


@router.post("/train-models")
async def train_ai_models(
    force_retrain: bool = Query(False, description="Force retraining even if models exist"),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Train AI models with historical data (Admin only)."""
    try:
        # Check if models are already trained
        if (ai_service.doctor_allocation_model.is_trained and
            ai_service.scheduling_model.is_trained and
            not force_retrain):
            return {
                "success": True,
                "message": "Models are already trained. Use force_retrain=true to retrain.",
                "status": "already_trained"
            }

        result = ai_service.train_models_with_data(db)

        return {
            "success": True,
            "data": result,
            "message": "Model training completed" if result.get("status") == "completed" else "Model training skipped"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to train AI models: {str(e)}"
        )


@router.get("/health")
async def ai_health_check():
    """Health check for AI services."""
    try:
        return {
            "status": "healthy",
            "ai_service_initialized": True,
            "models_loaded": ai_service.models_loaded,
            "doctor_model_trained": ai_service.doctor_allocation_model.is_trained,
            "scheduling_model_trained": ai_service.scheduling_model.is_trained,
            "feature_engineer_ready": ai_service.feature_engineer.is_fitted
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI services unavailable: {str(e)}"
        )