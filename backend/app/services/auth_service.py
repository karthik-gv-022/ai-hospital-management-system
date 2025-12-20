from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.schemas.user import UserCreate, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token


class AuthService:
    """Authentication service for user management."""

    @staticmethod
    def create_user(db: Session, user_data: UserCreate, role: UserRole) -> User:
        """Create a new user."""
        # Check if user with email already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash the password
        hashed_password = get_password_hash(user_data.password)

        # Create user
        db_user = User(
            email=user_data.email,
            password_hash=hashed_password,
            role=role,
            is_active=True
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return db_user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = db.query(User).filter(User.email == email).first()

        if not user:
            return None

        if not verify_password(password, user.password_hash):
            return None

        if not user.is_active:
            return None

        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()

        return user

    @staticmethod
    def login_user(db: Session, login_data: UserLogin) -> dict:
        """Login user and return tokens."""
        user = AuthService.authenticate_user(db, login_data.email, login_data.password)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user
        }

    @staticmethod
    def refresh_access_token(refresh_token: str) -> str:
        """Create new access token from refresh token."""
        from app.core.security import verify_token

        payload = verify_token(refresh_token, "refresh")
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        # Create new access token
        access_token = create_access_token(data={"sub": user_id})
        return access_token

    @staticmethod
    def change_password(db: Session, user_id: str, current_password: str, new_password: str) -> bool:
        """Change user password."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Verify current password
        if not verify_password(current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )

        # Update password
        user.password_hash = get_password_hash(new_password)
        db.commit()

        return True

    @staticmethod
    def deactivate_user(db: Session, user_id: str) -> bool:
        """Deactivate user account."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        user.is_active = False
        db.commit()

        return True

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def generate_password_reset_token(user_id: str) -> str:
        """Generate a password reset token."""
        # For demo purposes, create a simple token
        # In production, use proper JWT tokens with expiration
        from app.core.security import create_access_token
        import secrets

        # Create a reset token with a random component
        reset_payload = {
            "sub": user_id,
            "type": "password_reset",
            "token": secrets.token_urlsafe(32)
        }

        return create_access_token(data=reset_payload)

    @staticmethod
    def reset_password(db: Session, reset_token: str, new_password: str) -> bool:
        """Reset user password using reset token."""
        from app.core.security import verify_token

        payload = verify_token(reset_token)
        if not payload or payload.get("type") != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token"
            )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token"
            )

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Update password
        user.password_hash = get_password_hash(new_password)
        db.commit()

        return True