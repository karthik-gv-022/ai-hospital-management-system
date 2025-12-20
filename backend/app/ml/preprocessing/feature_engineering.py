"""Feature engineering for hospital management ML models."""
from typing import List, Dict, Any
from datetime import datetime, time
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer


class FeatureEngineer:
    """Feature engineering for doctor allocation and scheduling predictions."""

    def __init__(self):
        self.symptoms_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        self.specialization_encoder = LabelEncoder()
        self.department_encoder = LabelEncoder()
        self.scaler = StandardScaler()
        self.is_fitted = False

    def fit(self, training_data: pd.DataFrame):
        """Fit the feature engineering components on training data."""
        # Fit text vectorizer for symptoms
        if 'symptoms' in training_data.columns:
            self.symptoms_vectorizer.fit(training_data['symptoms'].fillna(''))

        # Fit categorical encoders
        if 'specialization' in training_data.columns:
            self.scaler.fit(training_data[['specialization']])
            unique_specializations = training_data['specialization'].unique()
            self.specialization_encoder.fit(unique_specializations)

        if 'department' in training_data.columns:
            unique_departments = training_data['department'].unique()
            self.department_encoder.fit(unique_departments)

        # Fit numerical scaler
        numerical_features = ['experience_years', 'consultation_fee', 'current_workload']
        available_features = [f for f in numerical_features if f in training_data.columns]
        if available_features:
            self.scaler.fit(training_data[available_features].fillna(0))

        self.is_fitted = True

    def transform_doctor_features(self, doctors_data: List[Dict[str, Any]]) -> np.ndarray:
        """Transform doctor data into feature vectors."""
        if not self.is_fitted:
            raise ValueError("FeatureEngineer must be fitted before transforming data")

        df = pd.DataFrame(doctors_data)

        # Text features (symptoms - for appointment context)
        symptoms_features = np.zeros((len(df), 100))  # Default TF-IDF dimensions
        if 'symptoms' in df.columns:
            symptoms_text = df['symptoms'].fillna('')
            try:
                symptoms_features = self.symptoms_vectorizer.transform(symptoms_text).toarray()
            except:
                symptoms_features = np.zeros((len(df), 100))

        # Categorical features
        categorical_features = []
        if 'specialization' in df.columns:
            try:
                specialization_encoded = self.specialization_encoder.transform(df['specialization'])
                categorical_features.append(specialization_encoded.reshape(-1, 1))
            except ValueError:
                # Handle unseen specializations
                specialization_encoded = np.zeros(len(df))
                categorical_features.append(specialization_encoded.reshape(-1, 1))

        if 'department' in df.columns:
            try:
                department_encoded = self.department_encoder.transform(df['department'])
                categorical_features.append(department_encoded.reshape(-1, 1))
            except ValueError:
                # Handle unseen departments
                department_encoded = np.zeros(len(df))
                categorical_features.append(department_encoded.reshape(-1, 1))

        # Numerical features
        numerical_features = ['experience_years', 'consultation_fee', 'current_workload']
        numerical_data = []
        for feature in numerical_features:
            if feature in df.columns:
                numerical_data.append(df[feature].fillna(0).values.reshape(-1, 1))

        # Time-based features
        time_features = []
        if 'appointment_time' in df.columns:
            # Extract hour and minute, convert to cyclical features
            df['hour'] = pd.to_datetime(df['appointment_time'], format='%H:%M:%S').dt.hour
            df['minute'] = pd.to_datetime(df['appointment_time'], format='%H:%M:%S').dt.minute

            # Cyclical encoding
            hour_sin = np.sin(2 * np.pi * df['hour'] / 24).values.reshape(-1, 1)
            hour_cos = np.cos(2 * np.pi * df['hour'] / 24).values.reshape(-1, 1)
            minute_sin = np.sin(2 * np.pi * df['minute'] / 60).values.reshape(-1, 1)
            minute_cos = np.cos(2 * np.pi * df['minute'] / 60).values.reshape(-1, 1)

            time_features.extend([hour_sin, hour_cos, minute_sin, minute_cos])

        if 'day_of_week' in df.columns:
            # Day of week cyclical encoding (0=Monday, 6=Sunday)
            day_sin = np.sin(2 * np.pi * df['day_of_week'] / 7).values.reshape(-1, 1)
            day_cos = np.cos(2 * np.pi * df['day_of_week'] / 7).values.reshape(-1, 1)
            time_features.extend([day_sin, day_cos])

        # Combine all features
        all_features = [symptoms_features]

        if categorical_features:
            all_features.extend(categorical_features)

        if numerical_data:
            # Scale numerical features
            numerical_array = np.hstack(numerical_data)
            numerical_scaled = self.scaler.transform(numerical_array)
            all_features.append(numerical_scaled)

        if time_features:
            all_features.extend(time_features)

        return np.hstack(all_features)

    def transform_appointment_features(self, appointments_data: List[Dict[str, Any]]) -> np.ndarray:
        """Transform appointment data into feature vectors for scheduling optimization."""
        df = pd.DataFrame(appointments_data)

        features = []

        # Time-based features
        if 'appointment_time' in df.columns:
            df['hour'] = pd.to_datetime(df['appointment_time'], format='%H:%M:%S').dt.hour
            df['minute'] = pd.to_datetime(df['appointment_time'], format='%H:%M:%S').dt.minute

            hour_sin = np.sin(2 * np.pi * df['hour'] / 24).values.reshape(-1, 1)
            hour_cos = np.cos(2 * np.pi * df['hour'] / 24).values.reshape(-1, 1)
            minute_sin = np.sin(2 * np.pi * df['minute'] / 60).values.reshape(-1, 1)
            minute_cos = np.cos(2 * np.pi * df['minute'] / 60).values.reshape(-1, 1)

            features.extend([hour_sin, hour_cos, minute_sin, minute_cos])

        # Day of week features
        if 'day_of_week' in df.columns:
            day_sin = np.sin(2 * np.pi * df['day_of_week'] / 7).values.reshape(-1, 1)
            day_cos = np.cos(2 * np.pi * df['day_of_week'] / 7).values.reshape(-1, 1)
            features.extend([day_sin, day_cos])

        # Queue position
        if 'queue_position' in df.columns:
            queue_position = df['queue_position'].fillna(0).values.reshape(-1, 1)
            features.append(queue_position)

        # Doctor workload
        if 'doctor_workload' in df.columns:
            workload = df['doctor_workload'].fillna(0).values.reshape(-1, 1)
            features.append(workload)

        # Patient complexity (simplified - based on symptoms length)
        if 'symptoms' in df.columns:
            symptoms_length = df['symptoms'].fillna('').str.len().values.reshape(-1, 1)
            features.append(symptoms_length)

        return np.hstack(features) if features else np.array([]).reshape(len(df), 0)

    def get_feature_names(self) -> List[str]:
        """Get names of the features for interpretability."""
        feature_names = []

        # TF-IDF features (symptoms)
        feature_names.extend([f'symptom_tfidf_{i}' for i in range(100)])

        # Categorical features
        if hasattr(self.specialization_encoder, 'classes_'):
            feature_names.extend(['specialization_encoded'])

        if hasattr(self.department_encoder, 'classes_'):
            feature_names.extend(['department_encoded'])

        # Numerical features
        feature_names.extend(['experience_years_scaled', 'consultation_fee_scaled', 'current_workload_scaled'])

        # Time features
        feature_names.extend(['hour_sin', 'hour_cos', 'minute_sin', 'minute_cos'])
        feature_names.extend(['day_sin', 'day_cos'])

        return feature_names