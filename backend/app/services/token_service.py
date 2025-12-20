from typing import Optional, List
from datetime import datetime, date, time
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.token import Token, TokenStatus
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.schemas.token import TokenCreate


class TokenService:
    """Service for token management."""

    @staticmethod
    def generate_token(db: Session, token_data: TokenCreate, patient_id: str) -> Token:
        """Generate a new token for a patient."""
        # Verify patient exists
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )

        # Verify doctor exists and is active
        doctor = db.query(Doctor).filter(Doctor.id == token_data.doctor_id, Doctor.is_active == True).first()
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found or inactive"
            )

        # If appointment_id is provided, verify appointment exists and belongs to patient
        appointment = None
        if token_data.appointment_id:
            appointment = db.query(Appointment).filter(
                Appointment.id == token_data.appointment_id,
                Appointment.patient_id == patient_id
            ).first()

            if not appointment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Appointment not found or doesn't belong to patient"
                )

            if appointment.doctor_id != token_data.doctor_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Appointment doesn't belong to specified doctor"
                )

        # Generate token number for the day
        token_number = TokenService._get_next_token_number(db, token_data.doctor_id, token_data.appointment_date)

        # Calculate estimated wait time
        estimated_wait_time = TokenService._calculate_wait_time(db, token_data.doctor_id, token_number, token_data.appointment_date)

        # Create token
        db_token = Token(
            patient_id=patient_id,
            doctor_id=token_data.doctor_id,
            token_number=token_number,
            appointment_date=token_data.appointment_date,
            status=TokenStatus.WAITING,
            estimated_wait_time=estimated_wait_time
        )

        db.add(db_token)
        db.commit()
        db.refresh(db_token)

        return db_token

    @staticmethod
    def _get_next_token_number(db: Session, doctor_id: str, appointment_date: date) -> int:
        """Get the next token number for a doctor on a specific date."""
        last_token = db.query(Token).filter(
            Token.doctor_id == doctor_id,
            Token.appointment_date == appointment_date
        ).order_by(Token.token_number.desc()).first()

        return (last_token.token_number + 1) if last_token else 1

    @staticmethod
    def _calculate_wait_time(db: Session, doctor_id: str, token_number: int, appointment_date: date) -> int:
        """Calculate estimated wait time for a token."""
        # Average consultation time for the doctor (default 15 minutes)
        average_consultation_time = 15

        # Count waiting tokens before this one
        waiting_tokens = db.query(Token).filter(
            Token.doctor_id == doctor_id,
            Token.appointment_date == appointment_date,
            Token.token_number < token_number,
            Token.status.in_([TokenStatus.WAITING, TokenStatus.CALLED])
        ).count()

        # Calculate wait time based on tokens ahead
        estimated_wait_time = waiting_tokens * average_consultation_time

        # Add buffer time (5 minutes)
        estimated_wait_time += 5

        return estimated_wait_time

    @staticmethod
    def get_token_by_id(db: Session, token_id: str) -> Optional[Token]:
        """Get token by ID."""
        return db.query(Token).filter(Token.id == token_id).first()

    @staticmethod
    def get_current_token(db: Session, doctor_id: str) -> Optional[Token]:
        """Get current token being served for a doctor."""
        return db.query(Token).filter(
            Token.doctor_id == doctor_id,
            Token.appointment_date == date.today(),
            Token.status == TokenStatus.CALLED
        ).order_by(Token.token_number).first()

    @staticmethod
    def get_next_token(db: Session, doctor_id: str) -> Optional[Token]:
        """Get next token to be called for a doctor."""
        return db.query(Token).filter(
            Token.doctor_id == doctor_id,
            Token.appointment_date == date.today(),
            Token.status == TokenStatus.WAITING
        ).order_by(Token.token_number).first()

    @staticmethod
    def get_token_queue(db: Session, doctor_id: str) -> List[Token]:
        """Get all tokens in queue for a doctor today."""
        return db.query(Token).filter(
            Token.doctor_id == doctor_id,
            Token.appointment_date == date.today()
        ).order_by(Token.token_number).all()

    @staticmethod
    def call_token(db: Session, token_id: str) -> Token:
        """Call a token (mark as CALLED)."""
        token = db.query(Token).filter(Token.id == token_id).first()
        if not token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Token not found"
            )

        if token.status != TokenStatus.WAITING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot call token with status {token.status}"
            )

        token.status = TokenStatus.CALLED
        token.called_at = datetime.utcnow()
        token.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(token)

        return token

    @staticmethod
    def complete_token(db: Session, token_id: str, actual_wait_time: int, notes: Optional[str] = None) -> Token:
        """Mark a token as completed."""
        token = db.query(Token).filter(Token.id == token_id).first()
        if not token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Token not found"
            )

        if token.status != TokenStatus.CALLED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot complete token with status {token.status}"
            )

        token.status = TokenStatus.COMPLETED
        token.actual_wait_time = actual_wait_time
        token.completed_at = datetime.utcnow()
        token.updated_at = datetime.utcnow()

        # Update the corresponding appointment status if exists
        appointment = db.query(Appointment).filter(
            Appointment.patient_id == token.patient_id,
            Appointment.doctor_id == token.doctor_id,
            Appointment.appointment_date == token.appointment_date
        ).first()

        if appointment and appointment.status != "Completed":
            appointment.status = "Completed"
            appointment.notes = notes or appointment.notes
            db.commit()

        db.refresh(token)
        return token

    @staticmethod
    def cancel_token(db: Session, token_id: str) -> Token:
        """Cancel a token."""
        token = db.query(Token).filter(Token.id == token_id).first()
        if not token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Token not found"
            )

        if token.status in [TokenStatus.COMPLETED, TokenStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel token with status {token.status}"
            )

        token.status = TokenStatus.CANCELLED
        token.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(token)

        return token

    @staticmethod
    def get_token_display(db: Session, doctor_id: str) -> dict:
        """Get token display information for a doctor."""
        current_token = TokenService.get_current_token(db, doctor_id)
        next_token = TokenService.get_next_token(db, doctor_id)
        queue = TokenService.get_token_queue(db, doctor_id)

        # Calculate statistics
        waiting_count = len([t for t in queue if t.status == TokenStatus.WAITING])
        completed_count = len([t for t in queue if t.status == TokenStatus.COMPLETED])
        cancelled_count = len([t for t in queue if t.status == TokenStatus.CANCELLED])

        # Calculate average wait time
        completed_tokens = [t for t in queue if t.status == TokenStatus.COMPLETED and t.actual_wait_time]
        average_wait_time = sum(t.actual_wait_time for t in completed_tokens) // len(completed_tokens) if completed_tokens else 0

        return {
            "current_token": current_token,
            "next_token": next_token,
            "queue_status": {
                "total_patients": len(queue),
                "waiting_count": waiting_count,
                "completed_count": completed_count,
                "cancelled_count": cancelled_count
            },
            "average_wait_time": average_wait_time,
            "estimated_wait_time": next_token.estimated_wait_time if next_token else 0
        }

    @staticmethod
    def get_patient_tokens(db: Session, patient_id: str, status_filter: Optional[TokenStatus] = None) -> List[Token]:
        """Get patient's tokens with optional status filter."""
        query = db.query(Token).filter(Token.patient_id == patient_id)

        if status_filter:
            query = query.filter(Token.status == status_filter)

        return query.order_by(Token.appointment_date.desc(), Token.token_number.desc()).all()

    @staticmethod
    def update_wait_times(db: Session, doctor_id: str):
        """Update estimated wait times for all waiting tokens of a doctor."""
        waiting_tokens = db.query(Token).filter(
            Token.doctor_id == doctor_id,
            Token.appointment_date == date.today(),
            Token.status == TokenStatus.WAITING
        ).order_by(Token.token_number).all()

        # Average consultation time
        average_consultation_time = 15

        for i, token in enumerate(waiting_tokens):
            # Calculate wait time based on position in queue
            tokens_ahead = i
            new_wait_time = (tokens_ahead * average_consultation_time) + 5

            token.estimated_wait_time = new_wait_time

        db.commit()

    @staticmethod
    def get_daily_token_summary(db: Session, doctor_id: str, target_date: date) -> dict:
        """Get daily token summary for a doctor."""
        tokens = db.query(Token).filter(
            Token.doctor_id == doctor_id,
            Token.appointment_date == target_date
        ).all()

        total_tokens = len(tokens)
        waiting_tokens = len([t for t in tokens if t.status == TokenStatus.WAITING])
        called_tokens = len([t for t in tokens if t.status == TokenStatus.CALLED])
        completed_tokens = len([t for t in tokens if t.status == TokenStatus.COMPLETED])
        cancelled_tokens = len([t for t in tokens if t.status == TokenStatus.CANCELLED])

        # Calculate average wait time
        completed_with_wait = [t for t in tokens if t.status == TokenStatus.COMPLETED and t.actual_wait_time]
        average_wait_time = sum(t.actual_wait_time for t in completed_with_wait) // len(completed_with_wait) if completed_with_wait else 0

        return {
            "date": target_date.isoformat(),
            "total_tokens": total_tokens,
            "waiting": waiting_tokens,
            "called": called_tokens,
            "completed": completed_tokens,
            "cancelled": cancelled_tokens,
            "average_wait_time": average_wait_time,
            "completion_rate": (completed_tokens / total_tokens * 100) if total_tokens > 0 else 0
        }