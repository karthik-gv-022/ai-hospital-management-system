"""Doctor allocation model using machine learning."""
import joblib
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report
import logging

logger = logging.getLogger(__name__)


class DoctorAllocationModel:
    """Machine learning model for recommending optimal doctor allocation."""

    def __init__(self):
        self.model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        self.feature_engineer = None
        self.is_trained = False
        self.doctor_cache = {}  # Cache for doctor data

    def set_feature_engineer(self, feature_engineer):
        """Set the feature engineer for preprocessing."""
        self.feature_engineer = feature_engineer

    def train(self, training_data: pd.DataFrame, target: pd.Series) -> Dict[str, float]:
        """Train the doctor allocation model."""
        try:
            logger.info("Starting doctor allocation model training...")

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                training_data, target, test_size=0.2, random_state=42, stratify=target
            )

            # Train model
            self.model.fit(X_train, y_train)

            # Evaluate model
            train_score = self.model.score(X_train, y_train)
            test_score = self.model.score(X_test, y_test)
            cv_scores = cross_val_score(self.model, X_train, y_train, cv=5)

            # Log performance
            logger.info(f"Training accuracy: {train_score:.3f}")
            logger.info(f"Test accuracy: {test_score:.3f}")
            logger.info(f"Cross-validation mean: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")

            self.is_trained = True

            return {
                "train_accuracy": train_score,
                "test_accuracy": test_score,
                "cv_mean": cv_scores.mean(),
                "cv_std": cv_scores.std()
            }

        except Exception as e:
            logger.error(f"Error training doctor allocation model: {str(e)}")
            raise

    def predict_doctors(
        self,
        patient_symptoms: str,
        preferred_date: str,
        preferred_specialization: str = None,
        available_doctors: List[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Predict optimal doctors for a patient."""
        if not self.is_trained:
            # Return rule-based recommendations if model is not trained
            return self._rule_based_recommendations(
                patient_symptoms, preferred_specialization, available_doctors
            )

        try:
            # Prepare features for prediction
            doctor_features = self._prepare_prediction_features(
                patient_symptoms, preferred_date, available_doctors
            )

            if doctor_features.shape[0] == 0:
                return []

            # Get prediction probabilities
            probabilities = self.model.predict_proba(doctor_features)
            predicted_classes = self.model.predict(doctor_features)

            # Combine results with doctor information
            recommendations = []
            for i, doctor in enumerate(available_doctors):
                if i < len(probabilities):
                    confidence = max(probabilities[i])
                    recommendation_score = confidence

                    # Calculate additional factors
                    availability_score = self._calculate_availability_score(doctor, preferred_date)
                    specialization_match = self._calculate_specialization_match(
                        doctor, preferred_specialization, patient_symptoms
                    )

                    # Combine scores (weighted average)
                    final_score = (
                        0.5 * recommendation_score +
                        0.3 * availability_score +
                        0.2 * specialization_match
                    )

                    recommendations.append({
                        "doctor_id": doctor.get("id"),
                        "doctor_name": f"{doctor.get('first_name', '')} {doctor.get('last_name', '')}",
                        "specialization": doctor.get("specialization", ""),
                        "department": doctor.get("department", ""),
                        "consultation_fee": doctor.get("consultation_fee", 0),
                        "confidence_score": confidence,
                        "recommendation_score": final_score,
                        "availability_score": availability_score,
                        "specialization_match": specialization_match,
                        "reasoning": self._generate_reasoning(doctor, final_score, confidence, specialization_match),
                        "estimated_wait_time": self._estimate_wait_time(doctor, preferred_date)
                    })

            # Sort by recommendation score
            recommendations.sort(key=lambda x: x["recommendation_score"], reverse=True)

            return recommendations[:3]  # Return top 3 recommendations

        except Exception as e:
            logger.error(f"Error predicting doctors: {str(e)}")
            # Fallback to rule-based recommendations
            return self._rule_based_recommendations(
                patient_symptoms, preferred_specialization, available_doctors
            )

    def _prepare_prediction_features(
        self,
        patient_symptoms: str,
        preferred_date: str,
        available_doctors: List[Dict[str, Any]]
    ) -> np.ndarray:
        """Prepare features for model prediction."""
        doctor_data = []
        for doctor in available_doctors:
            doctor_info = doctor.copy()
            doctor_info["symptoms"] = patient_symptoms
            doctor_info["preferred_date"] = preferred_date
            doctor_data.append(doctor_info)

        if self.feature_engineer:
            return self.feature_engineer.transform_doctor_features(doctor_data)
        else:
            # Simple feature engineering fallback
            return self._simple_feature_engineering(doctor_data)

    def _simple_feature_engineering(self, doctor_data: List[Dict[str, Any]]) -> np.ndarray:
        """Simple fallback feature engineering."""
        features = []
        for doctor in doctor_data:
            feature_vector = [
                doctor.get("experience_years", 0),
                doctor.get("consultation_fee", 0),
                1 if doctor.get("is_active", False) else 0,
                len(doctor.get("available_days", [])),
                doctor.get("max_patients_per_day", 20)
            ]
            features.append(feature_vector)

        return np.array(features)

    def _rule_based_recommendations(
        self,
        patient_symptoms: str,
        preferred_specialization: str,
        available_doctors: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Rule-based fallback recommendations."""
        if not available_doctors:
            return []

        recommendations = []
        symptoms_lower = patient_symptoms.lower()

        # Simple keyword matching for specializations
        specialization_keywords = {
            "cardiology": ["heart", "chest pain", "palpitation", "blood pressure"],
            "pediatrics": ["child", "baby", "kids", "fever", "growth"],
            "orthopedics": ["bone", "joint", "fracture", "pain", "injury"],
            "general": ["general", "checkup", "routine", "fever", "cough"],
        }

        for doctor in available_doctors:
            doctor_specialization = doctor.get("specialization", "").lower()

            # Calculate specialization match
            match_score = 0.5  # Base score
            for specialization, keywords in specialization_keywords.items():
                if specialization in doctor_specialization:
                    if any(keyword in symptoms_lower for keyword in keywords):
                        match_score = 0.9
                        break
                    elif preferred_specialization and specialization in preferred_specialization.lower():
                        match_score = 0.8
                        break

            # Availability score based on available days
            availability_score = len(doctor.get("available_days", [])) / 7.0

            # Experience score
            experience_score = min(doctor.get("experience_years", 0) / 20.0, 1.0)

            # Final score
            final_score = (match_score * 0.5 + availability_score * 0.3 + experience_score * 0.2)

            recommendations.append({
                "doctor_id": doctor.get("id"),
                "doctor_name": f"{doctor.get('first_name', '')} {doctor.get('last_name', '')}",
                "specialization": doctor.get("specialization", ""),
                "department": doctor.get("department", ""),
                "consultation_fee": doctor.get("consultation_fee", 0),
                "confidence_score": match_score,
                "recommendation_score": final_score,
                "availability_score": availability_score,
                "specialization_match": match_score,
                "reasoning": f"Recommended based on {doctor.get('specialization', 'general practice')} expertise and availability",
                "estimated_wait_time": self._estimate_wait_time(doctor, "")
            })

        # Sort and return top 3
        recommendations.sort(key=lambda x: x["recommendation_score"], reverse=True)
        return recommendations[:3]

    def _calculate_availability_score(self, doctor: Dict[str, Any], preferred_date: str) -> float:
        """Calculate availability score for a doctor."""
        # Simple availability score based on available days and max patients
        available_days = len(doctor.get("available_days", []))
        max_patients = doctor.get("max_patients_per_day", 20)

        # Normalize scores
        days_score = available_days / 7.0
        capacity_score = min(max_patients / 30.0, 1.0)

        return (days_score + capacity_score) / 2.0

    def _calculate_specialization_match(
        self,
        doctor: Dict[str, Any],
        preferred_specialization: str,
        patient_symptoms: str
    ) -> float:
        """Calculate how well doctor's specialization matches patient needs."""
        if not preferred_specialization:
            return 0.5  # Neutral score if no preference

        doctor_specialization = doctor.get("specialization", "").lower()
        preferred_lower = preferred_specialization.lower()

        # Exact match
        if preferred_lower in doctor_specialization:
            return 1.0

        # Partial match
        if any(word in doctor_specialization for word in preferred_lower.split()):
            return 0.7

        return 0.3  # Low match

    def _generate_reasoning(
        self,
        doctor: Dict[str, Any],
        final_score: float,
        confidence: float,
        specialization_match: float
    ) -> str:
        """Generate reasoning for doctor recommendation."""
        reasons = []

        if specialization_match > 0.8:
            reasons.append("Excellent specialization match for your symptoms")
        elif specialization_match > 0.6:
            reasons.append("Good specialization match")

        if final_score > 0.8:
            reasons.append("High recommendation score")
        elif final_score > 0.6:
            reasons.append("Good overall match")

        if doctor.get("experience_years", 0) > 10:
            reasons.append(f"Extensive experience ({doctor.get('experience_years')} years)")

        if not reasons:
            reasons.append("Recommended based on availability and qualifications")

        return ". ".join(reasons)

    def _estimate_wait_time(self, doctor: Dict[str, Any], preferred_date: str) -> int:
        """Estimate wait time for a doctor."""
        # Simple estimation based on consultation fee and experience
        base_wait = 15  # Base 15 minutes

        # Adjust based on doctor popularity (simplified)
        experience_factor = min(doctor.get("experience_years", 0) / 10.0, 2.0)
        fee_factor = min(doctor.get("consultation_fee", 0) / 100.0, 1.5)

        estimated_wait = base_wait * (1 + experience_factor * 0.3 + fee_factor * 0.2)
        return int(estimated_wait)

    def save_model(self, filepath: str):
        """Save the trained model."""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")

        model_data = {
            "model": self.model,
            "is_trained": self.is_trained,
            "feature_engineer": self.feature_engineer
        }
        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")

    def load_model(self, filepath: str):
        """Load a trained model."""
        try:
            model_data = joblib.load(filepath)
            self.model = model_data["model"]
            self.is_trained = model_data["is_trained"]
            self.feature_engineer = model_data.get("feature_engineer")
            logger.info(f"Model loaded from {filepath}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise