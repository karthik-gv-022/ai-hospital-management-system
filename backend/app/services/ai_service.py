"""AI service integrating doctor allocation and scheduling optimization models."""
import os
import logging
from typing import List, Dict, Any, Optional
from datetime import date, datetime
from sqlalchemy.orm import Session

from app.ml.models.doctor_allocation import DoctorAllocationModel
from app.ml.models.scheduling_optimization import SchedulingOptimizationModel
from app.ml.preprocessing.feature_engineering import FeatureEngineer
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.token import Token
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """Main AI service for hospital management predictions."""

    def __init__(self):
        self.doctor_allocation_model = DoctorAllocationModel()
        self.scheduling_model = SchedulingOptimizationModel()
        self.feature_engineer = FeatureEngineer()
        self.models_loaded = False

        # Set up feature engineer for doctor allocation model
        self.doctor_allocation_model.set_feature_engineer(self.feature_engineer)

    def initialize_models(self):
        """Initialize or load ML models."""
        try:
            model_path = settings.MODEL_PATH
            os.makedirs(model_path, exist_ok=True)

            # Try to load existing models
            doctor_model_path = os.path.join(model_path, "doctor_allocation_model.pkl")
            scheduling_model_path = os.path.join(model_path, "scheduling_model.pkl")

            if os.path.exists(doctor_model_path):
                try:
                    self.doctor_allocation_model.load_model(doctor_model_path)
                    logger.info("Doctor allocation model loaded successfully")
                except Exception as e:
                    logger.warning(f"Failed to load doctor allocation model: {str(e)}")

            if os.path.exists(scheduling_model_path):
                try:
                    self.scheduling_model.load_model(scheduling_model_path)
                    logger.info("Scheduling optimization model loaded successfully")
                except Exception as e:
                    logger.warning(f"Failed to load scheduling model: {str(e)}")

            self.models_loaded = True

        except Exception as e:
            logger.error(f"Error initializing AI models: {str(e)}")
            self.models_loaded = False

    def recommend_doctors(
        self,
        db: Session,
        patient_symptoms: str,
        preferred_date: date,
        preferred_specialization: Optional[str] = None,
        limit: int = 5
    ) -> Dict[str, Any]:
        """AI-powered doctor recommendations."""
        try:
            # Get available doctors
            available_doctors = self._get_available_doctors(db, preferred_date, preferred_specialization)

            if not available_doctors:
                return {
                    "recommended_doctors": [],
                    "message": "No doctors available for the specified criteria",
                    "total_available": 0
                }

            # Prepare doctor data for prediction
            doctor_data = []
            for doctor in available_doctors[:limit]:
                # Calculate current workload
                current_workload = self._get_doctor_workload(db, str(doctor.id), preferred_date)

                doctor_info = {
                    "id": str(doctor.id),
                    "first_name": doctor.first_name,
                    "last_name": doctor.last_name,
                    "specialization": doctor.specialization,
                    "department": doctor.department,
                    "experience_years": doctor.experience_years,
                    "consultation_fee": float(doctor.consultation_fee),
                    "is_active": doctor.is_active,
                    "available_days": doctor.available_days or [],
                    "max_patients_per_day": doctor.max_patients_per_day,
                    "current_workload": current_workload
                }
                doctor_data.append(doctor_info)

            # Get recommendations from AI model
            recommendations = self.doctor_allocation_model.predict_doctors(
                patient_symptoms=patient_symptoms,
                preferred_date=preferred_date.isoformat(),
                preferred_specialization=preferred_specialization or "",
                available_doctors=doctor_data
            )

            # Enhance recommendations with additional data
            enhanced_recommendations = []
            for rec in recommendations:
                doctor_id = rec["doctor_id"]
                availability = self._get_doctor_availability_details(db, doctor_id, preferred_date)

                enhanced_rec = {
                    **rec,
                    "availability": availability,
                    "patient_reviews": self._get_mock_patient_reviews(doctor_id),
                    "success_rate": self._calculate_mock_success_rate(rec)
                }
                enhanced_recommendations.append(enhanced_rec)

            return {
                "recommended_doctors": enhanced_recommendations,
                "message": f"Found {len(enhanced_recommendations)} suitable doctors",
                "total_available": len(available_doctors),
                "recommendation_method": "ai_model" if self.doctor_allocation_model.is_trained else "rule_based"
            }

        except Exception as e:
            logger.error(f"Error in doctor recommendations: {str(e)}")
            return {
                "recommended_doctors": [],
                "message": f"Error generating recommendations: {str(e)}",
                "total_available": 0
            }

    def predict_wait_time(
        self,
        db: Session,
        doctor_id: str,
        appointment_date: date,
        appointment_time: str
    ) -> Dict[str, Any]:
        """Predict wait time for a specific appointment."""
        try:
            # Get current queue information
            current_queue_length = self._get_current_queue_length(db, doctor_id, appointment_date)
            doctor_workload = self._get_doctor_workload(db, doctor_id, appointment_date)

            # Get prediction from scheduling model
            prediction = self.scheduling_model.predict_wait_time(
                doctor_id=doctor_id,
                appointment_date=appointment_date.isoformat(),
                appointment_time=appointment_time,
                current_queue_length=current_queue_length,
                doctor_workload=doctor_workload
            )

            # Enhance with real-time data
            enhanced_prediction = {
                **prediction,
                "real_time_data": {
                    "current_queue_length": current_queue_length,
                    "doctor_workload": doctor_workload,
                    "average_consultation_time": self._get_average_consultation_time(db, doctor_id),
                    "patients_waiting": self._get_patients_waiting(db, doctor_id)
                }
            }

            return enhanced_prediction

        except Exception as e:
            logger.error(f"Error predicting wait time: {str(e)}")
            return {
                "predicted_wait_time": 20,
                "confidence": 0.3,
                "error": str(e),
                "message": "Unable to predict wait time accurately"
            }

    def get_scheduling_insights(
        self,
        db: Session,
        doctor_id: Optional[str] = None,
        date_range: int = 30
    ) -> Dict[str, Any]:
        """Get AI-powered scheduling insights and optimization suggestions."""
        try:
            # Get historical appointment data
            end_date = date.today()
            start_date = end_date - datetime.timedelta(days=date_range)

            appointments_query = db.query(Appointment).filter(
                Appointment.appointment_date >= start_date,
                Appointment.appointment_date <= end_date
            )

            if doctor_id:
                appointments_query = appointments_query.filter(Appointment.doctor_id == doctor_id)

            appointments = appointments_query.all()

            # Convert to list of dictionaries
            appointments_data = []
            for apt in appointments:
                appointments_data.append({
                    "doctor_id": str(apt.doctor_id),
                    "appointment_date": apt.appointment_date.isoformat(),
                    "appointment_time": apt.appointment_time.strftime("%H:%M:%S"),
                    "status": apt.status.value,
                    "wait_time": self._get_actual_wait_time(db, str(apt.id))
                })

            # Analyze patterns
            patterns = self.scheduling_model.analyze_scheduling_patterns(
                appointments_data, doctor_id
            )

            # Generate optimization suggestions
            optimization_suggestions = self._generate_optimization_suggestions(
                appointments_data, patterns
            )

            # Calculate efficiency metrics
            efficiency_metrics = self._calculate_efficiency_metrics(appointments_data)

            return {
                "analysis_period": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "total_days": date_range
                },
                "patterns": patterns,
                "optimization_suggestions": optimization_suggestions,
                "efficiency_metrics": efficiency_metrics,
                "total_appointments_analyzed": len(appointments_data)
            }

        except Exception as e:
            logger.error(f"Error generating scheduling insights: {str(e)}")
            return {
                "error": str(e),
                "message": "Unable to generate scheduling insights"
            }

    def _get_available_doctors(
        self,
        db: Session,
        preferred_date: date,
        preferred_specialization: Optional[str] = None
    ) -> List[Doctor]:
        """Get available doctors for the specified criteria."""
        query = db.query(Doctor).filter(Doctor.is_active == True)

        if preferred_specialization:
            query = query.filter(
                Doctor.specialization.ilike(f"%{preferred_specialization}%")
            )

        # Check if doctor is available on the preferred date
        day_of_week = preferred_date.strftime("%A")
        available_doctors = []

        for doctor in query.all():
            if doctor.available_days and day_of_week in doctor.available_days:
                # Check if doctor hasn't reached max capacity for the day
                current_appointments = db.query(Appointment).filter(
                    Appointment.doctor_id == doctor.id,
                    Appointment.appointment_date == preferred_date,
                    Appointment.status.in_(["Scheduled", "In Progress"])
                ).count()

                if current_appointments < doctor.max_patients_per_day:
                    available_doctors.append(doctor)

        return available_doctors

    def _get_doctor_workload(self, db: Session, doctor_id: str, target_date: date) -> int:
        """Calculate current workload for a doctor."""
        appointments_count = db.query(Appointment).filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == target_date,
            Appointment.status.in_(["Scheduled", "In Progress"])
        ).count()

        return appointments_count

    def _get_current_queue_length(self, db: Session, doctor_id: str, target_date: date) -> int:
        """Get current queue length for a doctor."""
        if target_date != date.today():
            return 0

        waiting_tokens = db.query(Token).filter(
            Token.doctor_id == doctor_id,
            Token.appointment_date == target_date,
            Token.status.in_(["Waiting", "Called"])
        ).count()

        return waiting_tokens

    def _get_doctor_availability_details(self, db: Session, doctor_id: str, target_date: date) -> Dict[str, Any]:
        """Get detailed availability information for a doctor."""
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            return {}

        current_appointments = self._get_doctor_workload(db, doctor_id, target_date)
        remaining_slots = doctor.max_patients_per_day - current_appointments

        return {
            "max_patients_per_day": doctor.max_patients_per_day,
            "current_appointments": current_appointments,
            "remaining_slots": max(0, remaining_slots),
            "available_time_start": doctor.available_time_start.strftime("%H:%M"),
            "available_time_end": doctor.available_time_end.strftime("%H:%M"),
            "available_days": doctor.available_days or []
        }

    def _get_mock_patient_reviews(self, doctor_id: str) -> Dict[str, Any]:
        """Get mock patient review data (in real implementation, this would come from database)."""
        # Mock data for demonstration
        import random
        return {
            "average_rating": round(random.uniform(4.0, 5.0), 1),
            "total_reviews": random.randint(50, 200),
            "recent_reviews": random.randint(1, 10)
        }

    def _calculate_mock_success_rate(self, recommendation: Dict[str, Any]) -> float:
        """Calculate mock success rate for recommendation (in real implementation, use historical data)."""
        import random
        base_rate = recommendation.get("confidence_score", 0.5)
        return min(0.95, base_rate + random.uniform(-0.1, 0.1))

    def _get_average_consultation_time(self, db: Session, doctor_id: str) -> int:
        """Get average consultation time for a doctor."""
        # Mock implementation - in real system, calculate from historical data
        return 15  # Default 15 minutes

    def _get_patients_waiting(self, db: Session, doctor_id: str) -> int:
        """Get number of patients currently waiting."""
        return db.query(Token).filter(
            Token.doctor_id == doctor_id,
            Token.appointment_date == date.today(),
            Token.status == "Waiting"
        ).count()

    def _get_actual_wait_time(self, db: Session, appointment_id: str) -> Optional[int]:
        """Get actual wait time for a completed appointment."""
        # This would need to join appointments with tokens
        # Mock implementation for now
        return None

    def _generate_optimization_suggestions(
        self,
        appointments_data: List[Dict[str, Any]],
        patterns: Dict[str, Any]
    ) -> List[str]:
        """Generate optimization suggestions based on patterns analysis."""
        suggestions = []

        if not appointments_data:
            return ["Insufficient data for optimization suggestions"]

        # Analyze peak hours
        if "peak_hours" in patterns and patterns["peak_hours"]:
            busiest_hour = max(patterns["peak_hours"].keys())
            suggestions.append(f"Consider reducing appointments during {busiest_hour}:00 as it's typically busiest")

        # Analyze wait time patterns
        if "wait_time_patterns" in patterns and patterns["wait_time_patterns"]:
            max_wait_hour = max(patterns["wait_time_patterns"], key=patterns["wait_time_patterns"].get)
            suggestions.append(f"Patients wait longest during {max_wait_hour}:00 - consider staff adjustments")

        # General suggestions
        total_appointments = len(appointments_data)
        if total_appointments > 0:
            completed_count = len([a for a in appointments_data if a.get("status") == "Completed"])
            completion_rate = completed_count / total_appointments

            if completion_rate < 0.8:
                suggestions.append("Consider improving appointment reminder system to reduce no-shows")
            elif completion_rate > 0.95:
                suggestions.append("High completion rate - consider increasing appointment capacity")

        return suggestions[:5]  # Return top 5 suggestions

    def _calculate_efficiency_metrics(self, appointments_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate efficiency metrics for the scheduling system."""
        if not appointments_data:
            return {}

        total_appointments = len(appointments_data)
        completed_appointments = len([a for a in appointments_data if a.get("status") == "Completed"])
        cancelled_appointments = len([a for a in appointments_data if a.get("status") == "Cancelled"])

        # Calculate average wait times where available
        wait_times = [a.get("wait_time") for a in appointments_data if a.get("wait_time") is not None]
        avg_wait_time = sum(wait_times) / len(wait_times) if wait_times else 0

        return {
            "total_appointments": total_appointments,
            "completed_appointments": completed_appointments,
            "cancelled_appointments": cancelled_appointments,
            "completion_rate": completed_appointments / total_appointments if total_appointments > 0 else 0,
            "cancellation_rate": cancelled_appointments / total_appointments if total_appointments > 0 else 0,
            "average_wait_time": avg_wait_time,
            "appointments_with_wait_time_data": len(wait_times)
        }

    def train_models_with_data(self, db: Session):
        """Train AI models with historical data from the database."""
        try:
            logger.info("Starting AI model training with database data...")

            # Get historical appointment data
            appointments = db.query(Appointment).all()
            if len(appointments) < 50:
                logger.warning("Insufficient data for effective model training")
                return {"message": "Insufficient training data", "status": "skipped"}

            # Prepare training data
            training_data = []
            targets = []

            for apt in appointments:
                # Create feature vector for training
                features = {
                    "specialization": apt.doctor.specialization,
                    "department": apt.doctor.department,
                    "experience_years": apt.doctor.experience_years,
                    "consultation_fee": float(apt.doctor.consultation_fee),
                    "symptoms": apt.symptoms or "",
                    "appointment_time": apt.appointment_time.strftime("%H:%M:%S"),
                    "day_of_week": apt.appointment_date.weekday()
                }

                training_data.append(features)
                # Use appointment outcome as target (simplified)
                targets.append(1 if apt.status.value == "Completed" else 0)

            # Convert to DataFrame
            import pandas as pd
            df = pd.DataFrame(training_data)
            target_series = pd.Series(targets)

            # Train feature engineer
            self.feature_engineer.fit(df)

            # Train doctor allocation model
            doctor_features = self.feature_engineer.transform_doctor_features(training_data)
            if doctor_features.shape[0] > 0:
                metrics = self.doctor_allocation_model.train(doctor_features, target_series)
                logger.info(f"Doctor allocation model trained: {metrics}")

            # Train scheduling model
            scheduling_data = []
            wait_targets = []

            for apt in appointments:
                sched_features = {
                    "appointment_time": apt.appointment_time.strftime("%H:%M:%S"),
                    "day_of_week": apt.appointment_date.weekday(),
                    "queue_position": 1,  # Simplified
                    "doctor_workload": 1  # Simplified
                }
                scheduling_data.append(sched_features)
                wait_targets.append(15)  # Default wait time (simplified)

            if scheduling_data:
                sched_df = pd.DataFrame(scheduling_data)
                wait_series = pd.Series(wait_targets)

                # Transform features
                from app.ml.preprocessing.feature_engineering import FeatureEngineer
                fe = FeatureEngineer()
                sched_features = fe.transform_appointment_features(scheduling_data)

                if sched_features.shape[1] > 0:
                    wait_metrics = self.scheduling_model.train_wait_time_model(sched_features, wait_series)
                    logger.info(f"Scheduling model trained: {wait_metrics}")

            # Save models
            self._save_trained_models()

            return {
                "message": "Models trained successfully",
                "training_samples": len(appointments),
                "status": "completed"
            }

        except Exception as e:
            logger.error(f"Error training models: {str(e)}")
            return {"message": f"Training failed: {str(e)}", "status": "failed"}

    def _save_trained_models(self):
        """Save trained models to disk."""
        try:
            model_path = settings.MODEL_PATH
            os.makedirs(model_path, exist_ok=True)

            doctor_model_path = os.path.join(model_path, "doctor_allocation_model.pkl")
            scheduling_model_path = os.path.join(model_path, "scheduling_model.pkl")

            if self.doctor_allocation_model.is_trained:
                self.doctor_allocation_model.save_model(doctor_model_path)

            if self.scheduling_model.is_trained:
                self.scheduling_model.save_model(scheduling_model_path)

            logger.info("Trained models saved successfully")

        except Exception as e:
            logger.error(f"Error saving models: {str(e)}")


# Global AI service instance
ai_service = AIService()