from typing import Optional, List
from datetime import datetime, date, time
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.doctor import Doctor
from app.models.user import User
from app.models.appointment import Appointment
from app.schemas.doctor import DoctorCreate, DoctorUpdate


class DoctorService:
    """Service for doctor management."""

    @staticmethod
    def create_doctor(db: Session, doctor_data: DoctorCreate) -> Doctor:
        """Create a new doctor."""
        # Check if doctor with email already exists
        existing_doctor = db.query(Doctor).filter(Doctor.email == doctor_data.email).first()
        if existing_doctor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor with this email already exists"
            )

        # Check if doctor with phone already exists
        existing_phone = db.query(Doctor).filter(Doctor.phone == doctor_data.phone).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor with this phone number already exists"
            )

        # Check if license number already exists
        existing_license = db.query(Doctor).filter(Doctor.license_number == doctor_data.license_number).first()
        if existing_license:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor with this license number already exists"
            )

        # Create doctor
        db_doctor = Doctor(
            first_name=doctor_data.first_name,
            last_name=doctor_data.last_name,
            email=doctor_data.email,
            phone=doctor_data.phone,
            specialization=doctor_data.specialization,
            department=doctor_data.department,
            license_number=doctor_data.license_number,
            experience_years=doctor_data.experience_years,
            consultation_fee=doctor_data.consultation_fee,
            available_days=doctor_data.available_days,
            available_time_start=doctor_data.available_time_start,
            available_time_end=doctor_data.available_time_end,
            max_patients_per_day=doctor_data.max_patients_per_day,
        )

        db.add(db_doctor)
        db.commit()
        db.refresh(db_doctor)

        return db_doctor

    @staticmethod
    def get_doctor_by_id(db: Session, doctor_id: str) -> Optional[Doctor]:
        """Get doctor by ID."""
        return db.query(Doctor).filter(Doctor.id == doctor_id, Doctor.is_active == True).first()

    @staticmethod
    def get_doctor_by_email(db: Session, email: str) -> Optional[Doctor]:
        """Get doctor by email."""
        return db.query(Doctor).filter(Doctor.email == email, Doctor.is_active == True).first()

    @staticmethod
    def get_doctor_by_user_id(db: Session, user_id: str) -> Optional[Doctor]:
        """Get doctor by user ID."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        return db.query(Doctor).filter(Doctor.email == user.email, Doctor.is_active == True).first()

    @staticmethod
    def get_doctors(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        specialization: Optional[str] = None,
        department: Optional[str] = None,
        available_today: Optional[bool] = None
    ) -> List[Doctor]:
        """Get doctors with optional filters."""
        query = db.query(Doctor).filter(Doctor.is_active == True)

        if specialization:
            query = query.filter(Doctor.specialization.ilike(f"%{specialization}%"))

        if department:
            query = query.filter(Doctor.department.ilike(f"%{department}%"))

        if available_today:
            from datetime import datetime
            today = datetime.now().strftime("%A")
            query = query.filter(Doctor.available_days.contains([today]))

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def update_doctor(db: Session, doctor_id: str, doctor_data: DoctorUpdate) -> Doctor:
        """Update doctor information."""
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        # Update fields if provided
        update_data = doctor_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(doctor, field):
                setattr(doctor, field, value)

        # Check for unique constraints if email, phone, or license is being updated
        if "email" in update_data:
            existing = db.query(Doctor).filter(
                Doctor.email == update_data["email"],
                Doctor.id != doctor_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered to another doctor"
                )

        if "phone" in update_data:
            existing = db.query(Doctor).filter(
                Doctor.phone == update_data["phone"],
                Doctor.id != doctor_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone number already registered to another doctor"
                )

        if "license_number" in update_data:
            existing = db.query(Doctor).filter(
                Doctor.license_number == update_data["license_number"],
                Doctor.id != doctor_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="License number already registered to another doctor"
                )

        doctor.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(doctor)

        return doctor

    @staticmethod
    def delete_doctor(db: Session, doctor_id: str) -> bool:
        """Soft delete doctor (deactivate)."""
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        # Soft delete by deactivating
        doctor.is_active = False

        # Deactivate associated user account
        user = db.query(User).filter(User.email == doctor.email).first()
        if user:
            user.is_active = False

        db.commit()
        return True

    @staticmethod
    def get_doctor_appointments(
        db: Session,
        doctor_id: str,
        appointment_date: Optional[date] = None,
        status: Optional[str] = None
    ) -> List[Appointment]:
        """Get doctor's appointments."""
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        query = db.query(Appointment).filter(Appointment.doctor_id == doctor_id)

        if appointment_date:
            query = query.filter(Appointment.appointment_date == appointment_date)

        if status:
            query = query.filter(Appointment.status == status)

        return query.order_by(Appointment.appointment_date, Appointment.appointment_time).all()

    @staticmethod
    def get_doctor_availability(db: Session, doctor_id: str, target_date: date) -> dict:
        """Get doctor's availability for a specific date."""
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id, Doctor.is_active == True).first()
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        # Check if doctor is available on this day of week
        from datetime import datetime
        day_of_week = target_date.strftime("%A")

        if doctor.available_days and day_of_week not in doctor.available_days:
            return {
                "is_available": False,
                "reason": f"Doctor not available on {day_of_week}"
            }

        # Count existing appointments for that day
        existing_appointments = db.query(Appointment).filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == target_date,
            Appointment.status.in_(["Scheduled", "In Progress"])
        ).count()

        remaining_slots = doctor.max_patients_per_day - existing_appointments

        return {
            "is_available": remaining_slots > 0,
            "remaining_slots": remaining_slots,
            "max_patients_per_day": doctor.max_patients_per_day,
            "available_time_start": doctor.available_time_start.strftime("%H:%M"),
            "available_time_end": doctor.available_time_end.strftime("%H:%M"),
            "consultation_fee": float(doctor.consultation_fee)
        }

    @staticmethod
    def update_doctor_availability(
        db: Session,
        doctor_id: str,
        available_days: List[str],
        available_time_start: time,
        available_time_end: time,
        max_patients_per_day: int
    ) -> Doctor:
        """Update doctor's availability."""
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        doctor.available_days = available_days
        doctor.available_time_start = available_time_start
        doctor.available_time_end = available_time_end
        doctor.max_patients_per_day = max_patients_per_day
        doctor.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(doctor)

        return doctor