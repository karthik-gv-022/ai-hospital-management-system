from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.patient import Patient
from app.models.user import User
from app.schemas.patient import PatientCreate, PatientUpdate


class PatientService:
    """Service for patient management."""

    @staticmethod
    def create_patient(db: Session, patient_data: PatientCreate, user_id: str) -> Patient:
        """Create a new patient profile."""
        # Check if patient with email already exists
        existing_patient = db.query(Patient).filter(Patient.email == patient_data.email).first()
        if existing_patient:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Patient with this email already exists"
            )

        # Check if patient with phone already exists
        existing_phone = db.query(Patient).filter(Patient.phone == patient_data.phone).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Patient with this phone number already exists"
            )

        # Create patient
        db_patient = Patient(
            first_name=patient_data.first_name,
            last_name=patient_data.last_name,
            email=patient_data.email,
            phone=patient_data.phone,
            date_of_birth=patient_data.date_of_birth,
            gender=patient_data.gender,
            address=patient_data.address,
            emergency_contact_name=patient_data.emergency_contact_name,
            emergency_contact_phone=patient_data.emergency_contact_phone,
            blood_group=patient_data.blood_group,
        )

        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)

        return db_patient

    @staticmethod
    def get_patient_by_id(db: Session, patient_id: str) -> Optional[Patient]:
        """Get patient by ID."""
        return db.query(Patient).filter(Patient.id == patient_id).first()

    @staticmethod
    def get_patient_by_email(db: Session, email: str) -> Optional[Patient]:
        """Get patient by email."""
        return db.query(Patient).filter(Patient.email == email).first()

    @staticmethod
    def get_patient_by_user_id(db: Session, user_id: str) -> Optional[Patient]:
        """Get patient by user ID."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        return db.query(Patient).filter(Patient.email == user.email).first()

    @staticmethod
    def update_patient(db: Session, patient_id: str, patient_data: PatientUpdate) -> Patient:
        """Update patient information."""
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )

        # Update fields if provided
        update_data = patient_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(patient, field):
                setattr(patient, field, value)

        # Check for unique constraints if email or phone is being updated
        if "email" in update_data:
            existing = db.query(Patient).filter(
                Patient.email == update_data["email"],
                Patient.id != patient_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered to another patient"
                )

        if "phone" in update_data:
            existing = db.query(Patient).filter(
                Patient.phone == update_data["phone"],
                Patient.id != patient_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone number already registered to another patient"
                )

        patient.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(patient)

        return patient

    @staticmethod
    def delete_patient(db: Session, patient_id: str) -> bool:
        """Delete patient record."""
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )

        # Soft delete by deactivating associated user account
        user = db.query(User).filter(User.email == patient.email).first()
        if user:
            user.is_active = False
            db.commit()

        return True

    @staticmethod
    def get_patients_paginated(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None
    ) -> List[Patient]:
        """Get paginated list of patients with optional search."""
        query = db.query(Patient)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Patient.first_name.ilike(search_term)) |
                (Patient.last_name.ilike(search_term)) |
                (Patient.email.ilike(search_term)) |
                (Patient.phone.ilike(search_term))
            )

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_patients_count(db: Session, search: Optional[str] = None) -> int:
        """Get total count of patients with optional search filter."""
        query = db.query(Patient)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Patient.first_name.ilike(search_term)) |
                (Patient.last_name.ilike(search_term)) |
                (Patient.email.ilike(search_term)) |
                (Patient.phone.ilike(search_term))
            )

        return query.count()