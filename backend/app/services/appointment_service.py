from typing import Optional, List
from datetime import datetime, date, time, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.appointment import Appointment, AppointmentStatus, ConsultationType, PaymentStatus
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate


class AppointmentService:
    """Service for appointment management."""

    @staticmethod
    def create_appointment(db: Session, appointment_data: AppointmentCreate, patient_id: str) -> Appointment:
        """Create a new appointment."""
        # Verify patient exists
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )

        # Verify doctor exists and is active
        doctor = db.query(Doctor).filter(Doctor.id == appointment_data.doctor_id, Doctor.is_active == True).first()
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found or inactive"
            )

        # Check if appointment date/time is in the future
        appointment_datetime = datetime.combine(
            appointment_data.appointment_date,
            appointment_data.appointment_time
        )

        if appointment_datetime <= datetime.now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Appointment date and time must be in the future"
            )

        # Check doctor availability for the requested date/time
        AppointmentService._check_doctor_availability(
            db, doctor.id, appointment_data.appointment_date, appointment_data.appointment_time
        )

        # Check for existing appointments at the same time
        existing_appointment = db.query(Appointment).filter(
            Appointment.doctor_id == appointment_data.doctor_id,
            Appointment.appointment_date == appointment_data.appointment_date,
            Appointment.appointment_time == appointment_data.appointment_time,
            Appointment.status.in_([AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS])
        ).first()

        if existing_appointment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor already has an appointment at this time"
            )

        # Create appointment
        db_appointment = Appointment(
            patient_id=patient_id,
            doctor_id=appointment_data.doctor_id,
            appointment_date=appointment_data.appointment_date,
            appointment_time=appointment_data.appointment_time,
            consultation_type=appointment_data.consultation_type,
            symptoms=appointment_data.symptoms,
            consultation_fee=doctor.consultation_fee,
            status=AppointmentStatus.SCHEDULED,
            payment_status=PaymentStatus.PENDING
        )

        db.add(db_appointment)
        db.commit()
        db.refresh(db_appointment)

        return db_appointment

    @staticmethod
    def _check_doctor_availability(db: Session, doctor_id: str, appointment_date: date, appointment_time: time):
        """Check if doctor is available at the requested date/time."""
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        # Check if doctor is available on this day of week
        day_of_week = appointment_date.strftime("%A")
        if doctor.available_days and day_of_week not in doctor.available_days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Doctor is not available on {day_of_week}s"
            )

        # Check if appointment time is within doctor's available hours
        if appointment_time < doctor.available_time_start or appointment_time > doctor.available_time_end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Doctor is only available from {doctor.available_time_start} to {doctor.available_time_end}"
            )

        # Check if doctor has reached maximum patients for the day
        existing_appointments = db.query(Appointment).filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == appointment_date,
            Appointment.status.in_([AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS])
        ).count()

        if existing_appointments >= doctor.max_patients_per_day:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor has reached maximum number of patients for this day"
            )

    @staticmethod
    def get_appointment_by_id(db: Session, appointment_id: str) -> Optional[Appointment]:
        """Get appointment by ID."""
        return db.query(Appointment).filter(Appointment.id == appointment_id).first()

    @staticmethod
    def get_patient_appointments(
        db: Session,
        patient_id: str,
        status_filter: Optional[AppointmentStatus] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None
    ) -> List[Appointment]:
        """Get patient's appointments with optional filtering."""
        query = db.query(Appointment).filter(Appointment.patient_id == patient_id)

        if status_filter:
            query = query.filter(Appointment.status == status_filter)

        if date_from:
            query = query.filter(Appointment.appointment_date >= date_from)

        if date_to:
            query = query.filter(Appointment.appointment_date <= date_to)

        return query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc()).all()

    @staticmethod
    def get_doctor_appointments(
        db: Session,
        doctor_id: str,
        status_filter: Optional[AppointmentStatus] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None
    ) -> List[Appointment]:
        """Get doctor's appointments with optional filtering."""
        query = db.query(Appointment).filter(Appointment.doctor_id == doctor_id)

        if status_filter:
            query = query.filter(Appointment.status == status_filter)

        if date_from:
            query = query.filter(Appointment.appointment_date >= date_from)

        if date_to:
            query = query.filter(Appointment.appointment_date <= date_to)

        return query.order_by(Appointment.appointment_date, Appointment.appointment_time).all()

    @staticmethod
    def update_appointment(
        db: Session,
        appointment_id: str,
        appointment_data: AppointmentUpdate,
        user_role: str,
        user_id: str
    ) -> Appointment:
        """Update appointment."""
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )

        # Check authorization
        AppointmentService._check_update_authorization(appointment, user_role, user_id)

        # Update fields if provided
        update_data = appointment_data.dict(exclude_unset=True)

        # Handle date/time updates (only if status is still Scheduled)
        if "appointment_date" in update_data or "appointment_time" in update_data:
            if appointment.status not in [AppointmentStatus.SCHEDULED]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot change date/time of appointment that is already in progress or completed"
                )

            new_date = update_data.get("appointment_date", appointment.appointment_date)
            new_time = update_data.get("appointment_time", appointment.appointment_time)

            # Check availability for new date/time
            AppointmentService._check_doctor_availability(db, appointment.doctor_id, new_date, new_time)

            # Check for conflicts with other appointments
            conflict_appointment = db.query(Appointment).filter(
                Appointment.doctor_id == appointment.doctor_id,
                Appointment.appointment_date == new_date,
                Appointment.appointment_time == new_time,
                Appointment.status.in_([AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS]),
                Appointment.id != appointment_id
            ).first()

            if conflict_appointment:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Doctor already has an appointment at the new time"
                )

        # Handle status updates
        if "status" in update_data:
            new_status = update_data["status"]
            AppointmentService._validate_status_transition(appointment.status, new_status, user_role)

        for field, value in update_data.items():
            if hasattr(appointment, field):
                setattr(appointment, field, value)

        appointment.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(appointment)

        return appointment

    @staticmethod
    def _check_update_authorization(appointment: Appointment, user_role: str, user_id: str):
        """Check if user is authorized to update the appointment."""
        # Admin can update any appointment
        if user_role == "admin":
            return

        # Patient can only update their own appointments
        if user_role == "patient":
            # Need to check if user_id matches patient_id through user relationship
            # This will be handled at the endpoint level
            return

        # Doctor can only update their own appointments
        if user_role == "doctor":
            # Need to check if user_id matches doctor_id through user relationship
            # This will be handled at the endpoint level
            return

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this appointment"
        )

    @staticmethod
    def _validate_status_transition(current_status: AppointmentStatus, new_status: AppointmentStatus, user_role: str):
        """Validate if status transition is allowed for the user role."""
        # Define allowed transitions by role
        patient_transitions = {
            AppointmentStatus.SCHEDULED: [AppointmentStatus.CANCELLED],
        }

        doctor_transitions = {
            AppointmentStatus.SCHEDULED: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELLED],
            AppointmentStatus.IN_PROGRESS: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
        }

        admin_transitions = {
            AppointmentStatus.SCHEDULED: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELLED],
            AppointmentStatus.IN_PROGRESS: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.SCHEDULED],
            AppointmentStatus.COMPLETED: [AppointmentStatus.SCHEDULED],
            AppointmentStatus.CANCELLED: [AppointmentStatus.SCHEDULED],
        }

        # Get allowed transitions for user role
        if user_role == "patient":
            allowed_transitions = patient_transitions
        elif user_role == "doctor":
            allowed_transitions = doctor_transitions
        elif user_role == "admin":
            allowed_transitions = admin_transitions
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid user role"
            )

        # Check if transition is allowed
        if current_status in allowed_transitions:
            if new_status not in allowed_transitions[current_status]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot transition appointment from {current_status} to {new_status} for {user_role}"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot update appointment with status {current_status}"
            )

    @staticmethod
    def cancel_appointment(db: Session, appointment_id: str, user_role: str, user_id: str) -> Appointment:
        """Cancel appointment."""
        appointment_data = AppointmentUpdate(status=AppointmentStatus.CANCELLED)
        return AppointmentService.update_appointment(db, appointment_id, appointment_data, user_role, user_id)

    @staticmethod
    def get_today_appointments(db: Session, doctor_id: Optional[str] = None) -> List[Appointment]:
        """Get today's appointments, optionally filtered by doctor."""
        today = date.today()
        query = db.query(Appointment).filter(Appointment.appointment_date == today)

        if doctor_id:
            query = query.filter(Appointment.doctor_id == doctor_id)

        return query.order_by(Appointment.appointment_time).all()

    @staticmethod
    def get_upcoming_appointments(db: Session, patient_id: str, days: int = 7) -> List[Appointment]:
        """Get patient's upcoming appointments within specified days."""
        from datetime import timedelta

        start_date = date.today()
        end_date = start_date + timedelta(days=days)

        return db.query(Appointment).filter(
            Appointment.patient_id == patient_id,
            Appointment.appointment_date >= start_date,
            Appointment.appointment_date <= end_date,
            Appointment.status.in_([AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS])
        ).order_by(Appointment.appointment_date, Appointment.appointment_time).all()