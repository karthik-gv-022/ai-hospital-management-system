"""Scheduling optimization model for predicting wait times and optimizing appointments."""
import joblib
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import logging
from datetime import datetime, time, timedelta

logger = logging.getLogger(__name__)


class SchedulingOptimizationModel:
    """Machine learning model for scheduling optimization and wait time prediction."""

    def __init__(self):
        self.wait_time_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.is_trained = False
        self.historical_patterns = {}

    def train_wait_time_model(self, training_data: pd.DataFrame, target: pd.Series) -> Dict[str, float]:
        """Train the wait time prediction model."""
        try:
            logger.info("Starting wait time model training...")

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                training_data, target, test_size=0.2, random_state=42
            )

            # Train model
            self.wait_time_model.fit(X_train, y_train)

            # Evaluate model
            train_predictions = self.wait_time_model.predict(X_train)
            test_predictions = self.wait_time_model.predict(X_test)

            train_mae = mean_absolute_error(y_train, train_predictions)
            test_mae = mean_absolute_error(y_test, test_predictions)
            test_rmse = np.sqrt(mean_squared_error(y_test, test_predictions))
            test_r2 = r2_score(y_test, test_predictions)

            # Cross-validation
            cv_scores = cross_val_score(
                self.wait_time_model, X_train, y_train, cv=5,
                scoring='neg_mean_absolute_error'
            )

            logger.info(f"Training MAE: {train_mae:.2f} minutes")
            logger.info(f"Test MAE: {test_mae:.2f} minutes")
            logger.info(f"Test RMSE: {test_rmse:.2f} minutes")
            logger.info(f"Test R²: {test_r2:.3f}")
            logger.info(f"CV MAE: {-cv_scores.mean():.2f} (+/- {cv_scores.std() * 2:.2f})")

            self.is_trained = True

            return {
                "train_mae": train_mae,
                "test_mae": test_mae,
                "test_rmse": test_rmse,
                "test_r2": test_r2,
                "cv_mae": -cv_scores.mean(),
                "cv_std": cv_scores.std()
            }

        except Exception as e:
            logger.error(f"Error training wait time model: {str(e)}")
            raise

    def predict_wait_time(
        self,
        doctor_id: str,
        appointment_date: str,
        appointment_time: str,
        current_queue_length: int = 0,
        doctor_workload: int = 0
    ) -> Dict[str, Any]:
        """Predict wait time for a specific appointment."""
        if not self.is_trained:
            # Use rule-based prediction if model is not trained
            return self._rule_based_wait_time_prediction(
                doctor_id, appointment_time, current_queue_length, doctor_workload
            )

        try:
            # Prepare features
            features = self._prepare_wait_time_features(
                doctor_id, appointment_date, appointment_time, current_queue_length, doctor_workload
            )

            if features.size == 0:
                return self._rule_based_wait_time_prediction(
                    doctor_id, appointment_time, current_queue_length, doctor_workload
                )

            # Make prediction
            predicted_wait = self.wait_time_model.predict(features.reshape(1, -1))[0]

            # Calculate confidence intervals (simplified)
            confidence = self._calculate_prediction_confidence(features)

            # Get optimization suggestions
            suggestions = self._generate_scheduling_suggestions(
                predicted_wait, current_queue_length, appointment_time
            )

            return {
                "predicted_wait_time": max(0, int(predicted_wait)),
                "confidence": confidence,
                "factors": {
                    "queue_length": current_queue_length,
                    "time_of_day": appointment_time,
                    "doctor_workload": doctor_workload
                },
                "optimization_suggestions": suggestions,
                "alternative_times": self._suggest_alternative_times(
                    appointment_date, appointment_time, predicted_wait
                )
            }

        except Exception as e:
            logger.error(f"Error predicting wait time: {str(e)}")
            return self._rule_based_wait_time_prediction(
                doctor_id, appointment_time, current_queue_length, doctor_workload
            )

    def _prepare_wait_time_features(
        self,
        doctor_id: str,
        appointment_date: str,
        appointment_time: str,
        current_queue_length: int,
        doctor_workload: int
    ) -> np.ndarray:
        """Prepare features for wait time prediction."""
        try:
            # Parse appointment time
            time_obj = datetime.strptime(appointment_time, "%H:%M:%S")
            hour = time_obj.hour
            minute = time_obj.minute

            # Time-based features
            hour_sin = np.sin(2 * np.pi * hour / 24)
            hour_cos = np.cos(2 * np.pi * hour / 24)
            minute_sin = np.sin(2 * np.pi * minute / 60)
            minute_cos = np.cos(2 * np.pi * minute / 60)

            # Day of week (simplified - assume weekday)
            day_of_week = datetime.strptime(appointment_date, "%Y-%m-%d").weekday()
            day_sin = np.sin(2 * np.pi * day_of_week / 7)
            day_cos = np.cos(2 * np.pi * day_of_week / 7)

            # Queue and workload features
            queue_position = current_queue_length
            workload_score = doctor_workload

            # Combine features
            features = np.array([
                hour_sin, hour_cos, minute_sin, minute_cos,
                day_sin, day_cos, queue_position, workload_score
            ])

            return features

        except Exception as e:
            logger.error(f"Error preparing features: {str(e)}")
            return np.array([])

    def _rule_based_wait_time_prediction(
        self,
        doctor_id: str,
        appointment_time: str,
        current_queue_length: int,
        doctor_workload: int
    ) -> Dict[str, Any]:
        """Rule-based wait time prediction fallback."""
        try:
            # Parse time
            time_obj = datetime.strptime(appointment_time, "%H:%M:%S")
            hour = time_obj.hour

            # Base wait time
            base_wait = 15  # 15 minutes base

            # Time of day adjustments
            if 9 <= hour <= 11:  # Morning rush
                time_factor = 1.5
            elif 14 <= hour <= 16:  # Afternoon rush
                time_factor = 1.3
            elif 17 <= hour <= 19:  # Evening rush
                time_factor = 1.4
            else:  # Off-peak
                time_factor = 1.0

            # Queue length impact
            queue_factor = 1 + (current_queue_length * 0.8)

            # Doctor workload impact
            workload_factor = 1 + (doctor_workload * 0.05)

            # Calculate predicted wait time
            predicted_wait = base_wait * time_factor * queue_factor * workload_factor

            # Generate suggestions
            suggestions = []
            if time_factor > 1.3:
                suggestions.append("Consider booking during off-peak hours (11 AM - 2 PM)")
            if current_queue_length > 3:
                suggestions.append("High queue length - consider alternative time")
            if doctor_workload > 15:
                suggestions.append("Doctor has high workload - expect longer wait")

            return {
                "predicted_wait_time": int(predicted_wait),
                "confidence": 0.6,  # Lower confidence for rule-based
                "factors": {
                    "queue_length": current_queue_length,
                    "time_of_day": appointment_time,
                    "doctor_workload": doctor_workload,
                    "time_factor": time_factor,
                    "queue_factor": queue_factor,
                    "workload_factor": workload_factor
                },
                "optimization_suggestions": suggestions if suggestions else ["Current timing appears optimal"],
                "alternative_times": self._suggest_alternative_times("", appointment_time, predicted_wait)
            }

        except Exception as e:
            logger.error(f"Error in rule-based prediction: {str(e)}")
            return {
                "predicted_wait_time": 20,  # Default estimate
                "confidence": 0.3,
                "factors": {"error": str(e)},
                "optimization_suggestions": ["Unable to provide specific suggestions"],
                "alternative_times": []
            }

    def _calculate_prediction_confidence(self, features: np.ndarray) -> float:
        """Calculate confidence score for prediction."""
        # Simplified confidence calculation
        # In practice, this could use prediction intervals or ensemble variance
        base_confidence = 0.7

        # Adjust based on feature quality
        if features.size > 0:
            # Check if features seem reasonable
            if np.any(np.isnan(features)) or np.any(np.isinf(features)):
                base_confidence -= 0.2

        return max(0.3, min(1.0, base_confidence))

    def _generate_scheduling_suggestions(
        self,
        predicted_wait: float,
        current_queue_length: int,
        appointment_time: str
    ) -> List[str]:
        """Generate scheduling optimization suggestions."""
        suggestions = []

        if predicted_wait > 30:
            suggestions.append("Consider rescheduling to a less busy time")
        elif predicted_wait > 20:
            suggestions.append("Moderate wait time expected - plan accordingly")
        else:
            suggestions.append("Good timing expected")

        if current_queue_length > 5:
            suggestions.append("High patient volume - expect delays")

        try:
            hour = datetime.strptime(appointment_time, "%H:%M:%S").hour
            if 8 <= hour <= 9:
                suggestions.append("Early morning appointments typically have shorter waits")
            elif 12 <= hour <= 13:
                suggestions.append("Lunch hour may have reduced staff availability")
        except:
            pass

        return suggestions

    def _suggest_alternative_times(
        self,
        appointment_date: str,
        current_time: str,
        current_wait: float
    ) -> List[Dict[str, Any]]:
        """Suggest alternative appointment times with lower predicted wait times."""
        alternatives = []

        try:
            current_hour = datetime.strptime(current_time, "%H:%M:%S").hour

            # Suggest earlier times
            if current_hour > 10:
                alternatives.append({
                    "time": "09:00:00",
                    "predicted_wait": max(5, current_wait - 10),
                    "reason": "Early morning typically less busy"
                })

            # Suggest midday times
            if current_hour < 12 or current_hour > 14:
                alternatives.append({
                    "time": "13:00:00",
                    "predicted_wait": max(8, current_wait - 5),
                    "reason": "Midday often has moderate wait times"
                })

            # Suggest late afternoon
            if current_hour < 16:
                alternatives.append({
                    "time": "16:30:00",
                    "predicted_wait": max(10, current_wait - 8),
                    "reason": "Late afternoon typically less crowded"
                })

        except Exception as e:
            logger.error(f"Error suggesting alternative times: {str(e)}")

        return alternatives[:2]  # Return top 2 alternatives

    def analyze_scheduling_patterns(
        self,
        appointments_data: List[Dict[str, Any]],
        doctor_id: str = None
    ) -> Dict[str, Any]:
        """Analyze historical scheduling patterns to provide insights."""
        try:
            if not appointments_data:
                return {"message": "No data available for analysis"}

            df = pd.DataFrame(appointments_data)

            # Filter by doctor if specified
            if doctor_id:
                df = df[df['doctor_id'] == doctor_id]

            # Peak hours analysis
            df['hour'] = pd.to_datetime(df['appointment_time'], format='%H:%M:%S').dt.hour
            peak_hours = df.groupby('hour').size().sort_values(ascending=False)

            # Wait time patterns by hour
            if 'wait_time' in df.columns:
                wait_by_hour = df.groupby('hour')['wait_time'].mean().sort_values()
            else:
                wait_by_hour = pd.Series()

            # Day of week patterns
            df['day_name'] = pd.to_datetime(df['appointment_date']).dt.day_name()
            busiest_days = df.groupby('day_name').size().sort_values(ascending=False)

            # Recommendations
            recommendations = []
            if not peak_hours.empty:
                least_busy_hour = peak_hours.index[-1]
                recommendations.append(f"Least busy hour: {least_busy_hour}:00")

            if not busiest_days.empty:
                least_busy_day = busiest_days.index[-1]
                recommendations.append(f"Least busy day: {least_busy_day}")

            return {
                "peak_hours": peak_hours.head(3).to_dict(),
                "least_busy_hours": peak_hours.tail(3).to_dict(),
                "wait_time_patterns": wait_by_hour.to_dict(),
                "busiest_days": busiest_days.head(3).to_dict(),
                "least_busy_days": busiest_days.tail(3).to_dict(),
                "recommendations": recommendations,
                "total_appointments_analyzed": len(df)
            }

        except Exception as e:
            logger.error(f"Error analyzing scheduling patterns: {str(e)}")
            return {"error": str(e)}

    def save_model(self, filepath: str):
        """Save the trained model."""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")

        model_data = {
            "wait_time_model": self.wait_time_model,
            "is_trained": self.is_trained,
            "historical_patterns": self.historical_patterns
        }
        joblib.dump(model_data, filepath)
        logger.info(f"Scheduling model saved to {filepath}")

    def load_model(self, filepath: str):
        """Load a trained model."""
        try:
            model_data = joblib.load(filepath)
            self.wait_time_model = model_data["wait_time_model"]
            self.is_trained = model_data["is_trained"]
            self.historical_patterns = model_data.get("historical_patterns", {})
            logger.info(f"Scheduling model loaded from {filepath}")
        except Exception as e:
            logger.error(f"Error loading scheduling model: {str(e)}")
            raise