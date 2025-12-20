from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date, datetime, timedelta
from app.db.database import get_db
from app.api.deps.auth import get_current_admin
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment, AppointmentStatus, PaymentStatus
from app.models.token import Token, TokenStatus
from app.schemas.doctor import DoctorCreate

router = APIRouter()


@router.get("/dashboard", response_model=Dict[str, Any])
async def get_dashboard_statistics(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics."""
    try:
        today = date.today()

        # Total counts
        total_patients = db.query(Patient).count()
        total_doctors = db.query(Doctor).filter(Doctor.is_active == True).count()
        total_users = db.query(User).filter(User.is_active == True).count()

        # Today's appointments
        today_appointments = db.query(Appointment).filter(
            Appointment.appointment_date == today
        ).count()

        # Today's active tokens
        today_tokens = db.query(Token).filter(
            Token.appointment_date == today
        ).count()

        # Revenue metrics (sum of consultation fees for completed appointments)
        from decimal import Decimal
        total_revenue = db.query(func.sum(Appointment.consultation_fee)).filter(
            Appointment.payment_status == PaymentStatus.PAID
        ).scalar() or Decimal('0')

        # This month's revenue
        current_month_start = today.replace(day=1)
        monthly_revenue = db.query(func.sum(Appointment.consultation_fee)).filter(
            Appointment.payment_status == PaymentStatus.PAID,
            Appointment.created_at >= current_month_start
        ).scalar() or Decimal('0')

        # Recent appointments (last 7 days)
        seven_days_ago = today - timedelta(days=7)
        recent_appointments = db.query(Appointment).filter(
            Appointment.appointment_date >= seven_days_ago
        ).count()

        # Patient demographics
        gender_distribution = db.query(
            Patient.gender,
            func.count(Patient.id).label('count')
        ).group_by(Patient.gender).all()

        # Department distribution
        department_distribution = db.query(
            Doctor.department,
            func.count(Doctor.id).label('count')
        ).filter(Doctor.is_active == True).group_by(Doctor.department).all()

        return {
            "overview": {
                "total_patients": total_patients,
                "total_doctors": total_doctors,
                "total_users": total_users,
                "today_appointments": today_appointments,
                "today_tokens": today_tokens,
                "recent_appointments": recent_appointments
            },
            "revenue": {
                "total_revenue": float(total_revenue),
                "monthly_revenue": float(monthly_revenue)
            },
            "demographics": {
                "gender_distribution": [
                    {"gender": gender.value if gender else "Unknown", "count": count}
                    for gender, count in gender_distribution
                ],
                "department_distribution": [
                    {"department": dept, "count": count}
                    for dept, count in department_distribution
                ]
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard statistics: {str(e)}"
        )


@router.get("/analytics", response_model=Dict[str, Any])
async def get_system_analytics(
    period: str = Query("week", pattern="^(day|week|month|year)$"),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get system analytics for charts and reports."""
    try:
        today = date.today()

        # Calculate date range based on period
        if period == "day":
            start_date = today
            date_format = "%Y-%m-%d %H:00"
            group_by = func.date_trunc('hour', Appointment.created_at)
        elif period == "week":
            start_date = today - timedelta(days=7)
            date_format = "%Y-%m-%d"
            group_by = func.date(Appointment.created_at)
        elif period == "month":
            start_date = today - timedelta(days=30)
            date_format = "%Y-%m-%d"
            group_by = func.date(Appointment.created_at)
        else:  # year
            start_date = today - timedelta(days=365)
            date_format = "%Y-%m"
            group_by = func.date_trunc('month', Appointment.created_at)

        # Patient visits over time
        patient_visits = db.query(
            group_by.label('date'),
            func.count(Appointment.id).label('visits')
        ).filter(
            Appointment.created_at >= start_date
        ).group_by(group_by).order_by(group_by).all()

        # Appointment status breakdown
        appointment_status_breakdown = db.query(
            Appointment.status,
            func.count(Appointment.id).label('count')
        ).filter(
            Appointment.created_at >= start_date
        ).group_by(Appointment.status).all()

        # Doctor workload distribution
        doctor_workload = db.query(
            Doctor.first_name,
            Doctor.last_name,
            Doctor.specialization,
            func.count(Appointment.id).label('appointments_count')
        ).join(
            Appointment, Doctor.id == Appointment.doctor_id
        ).filter(
            Appointment.created_at >= start_date,
            Doctor.is_active == True
        ).group_by(Doctor.id).order_by(desc('appointments_count')).limit(10).all()

        # Revenue trends
        revenue_trends = db.query(
            group_by.label('date'),
            func.sum(Appointment.consultation_fee).label('revenue')
        ).filter(
            Appointment.created_at >= start_date,
            Appointment.payment_status == PaymentStatus.PAID
        ).group_by(group_by).order_by(group_by).all()

        # Payment status breakdown
        payment_breakdown = db.query(
            Appointment.payment_status,
            func.count(Appointment.id).label('count'),
            func.sum(Appointment.consultation_fee).label('amount')
        ).filter(
            Appointment.created_at >= start_date
        ).group_by(Appointment.payment_status).all()

        return {
            "period": period,
            "date_range": {
                "start": start_date.isoformat(),
                "end": today.isoformat()
            },
            "patient_visits": [
                {
                    "date": visit[0].isoformat() if visit[0] else None,
                    "visits": visit[1]
                }
                for visit in patient_visits
            ],
            "appointment_status_breakdown": [
                {
                    "status": status.value,
                    "count": count
                }
                for status, count in appointment_status_breakdown
            ],
            "doctor_workload": [
                {
                    "doctor_name": f"{doc.first_name} {doc.last_name}",
                    "specialization": doc.specialization,
                    "appointments_count": doc.appointments_count
                }
                for doc in doctor_workload
            ],
            "revenue_trends": [
                {
                    "date": trend[0].isoformat() if trend[0] else None,
                    "revenue": float(trend[1]) if trend[1] else 0
                }
                for trend in revenue_trends
            ],
            "payment_breakdown": [
                {
                    "status": status.value,
                    "count": count,
                    "amount": float(amount) if amount else 0
                }
                for status, count, amount in payment_breakdown
            ]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analytics: {str(e)}"
        )


@router.post("/doctors", response_model=Dict[str, str])
async def add_doctor(
    doctor_data: dict,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new doctor (Admin only)."""
    try:
        from app.services.doctor_service import DoctorService
        from app.services.auth_service import AuthService

        # Extract doctor data and password
        doctor_create_data = DoctorCreate(**doctor_data)
        password = doctor_data.get("password", "doctor123")  # Default password

        # Create user account
        user_create = {
            "email": doctor_create_data.email,
            "password": password,
            "role": UserRole.DOCTOR
        }
        AuthService.create_user(db, user_create, UserRole.DOCTOR)

        # Create doctor profile
        doctor = DoctorService.create_doctor(db, doctor_create_data)

        return {
            "message": "Doctor added successfully",
            "doctor_id": str(doctor.id),
            "email": doctor.email,
            "default_password": password
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add doctor: {str(e)}"
        )


@router.get("/users", response_model=List[Dict[str, Any]])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all users with filtering options."""
    try:
        query = db.query(User)

        # Apply filters
        if search:
            search_term = f"%{search}%"
            query = query.filter(User.email.ilike(search_term))

        if role:
            try:
                role_enum = UserRole(role)
                query = query.filter(User.role == role_enum)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid role. Valid values: {[r.value for r in UserRole]}"
                )

        if is_active is not None:
            query = query.filter(User.is_active == is_active)

        # Order and paginate
        users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

        result = []
        for user in users:
            user_data = {
                "id": str(user.id),
                "email": user.email,
                "role": user.role.value,
                "is_active": user.is_active,
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "created_at": user.created_at.isoformat(),
                "updated_at": user.updated_at.isoformat()
            }

            # Add profile information based on role
            if user.role == UserRole.PATIENT:
                patient = db.query(Patient).filter(Patient.email == user.email).first()
                if patient:
                    user_data["profile"] = {
                        "name": f"{patient.first_name} {patient.last_name}",
                        "phone": patient.phone
                    }
            elif user.role == UserRole.DOCTOR:
                doctor = db.query(Doctor).filter(Doctor.email == user.email).first()
                if doctor:
                    user_data["profile"] = {
                        "name": f"{doctor.first_name} {doctor.last_name}",
                        "specialization": doctor.specialization,
                        "department": doctor.department,
                        "is_active": doctor.is_active
                    }

            result.append(user_data)

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get users: {str(e)}"
        )


@router.put("/users/{user_id}/status")
async def toggle_user_status(
    user_id: str,
    is_active: bool,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Activate or deactivate a user account."""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Prevent admin from deactivating themselves
        if str(user.id) == str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change your own account status"
            )

        user.is_active = is_active
        db.commit()

        # Also update related records (doctor/patient)
        if user.role == UserRole.DOCTOR:
            doctor = db.query(Doctor).filter(Doctor.email == user.email).first()
            if doctor:
                doctor.is_active = is_active
                db.commit()

        return {
            "message": f"User account {'activated' if is_active else 'deactivated'} successfully",
            "user_id": str(user.id),
            "email": user.email,
            "is_active": user.is_active
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user status: {str(e)}"
        )


@router.get("/system/health")
async def get_system_health(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get system health metrics."""
    try:
        # Database connection test
        db.execute("SELECT 1")

        # Check recent activity
        recent_activity_threshold = datetime.utcnow() - timedelta(hours=1)
        recent_appointments = db.query(Appointment).filter(
            Appointment.created_at >= recent_activity_threshold
        ).count()

        recent_tokens = db.query(Token).filter(
            Token.created_at >= recent_activity_threshold
        ).count()

        # System load indicators
        total_appointments_today = db.query(Appointment).filter(
            Appointment.appointment_date == date.today()
        ).count()

        active_doctors_today = db.query(Doctor).filter(
            Doctor.is_active == True
        ).count()

        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected",
            "recent_activity": {
                "last_hour_appointments": recent_appointments,
                "last_hour_tokens": recent_tokens,
                "today_appointments": total_appointments_today,
                "active_doctors": active_doctors_today
            },
            "system_info": {
                "timezone": "UTC",
                "version": "1.0.0"
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"System health check failed: {str(e)}"
        )