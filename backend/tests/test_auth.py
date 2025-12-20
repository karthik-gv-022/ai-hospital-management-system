"""Tests for authentication endpoints."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.database import get_db, Base, engine
from app.core.config import settings


# Override database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine.connect()
Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = Session(engine)
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


class TestAuthentication:
    """Test authentication endpoints."""

    def test_root_endpoint(self):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        assert "AI Hospital Management System API" in response.json()["message"]

    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_patient_registration(self):
        """Test patient registration."""
        patient_data = {
            "first_name": "Test",
            "last_name": "Patient",
            "email": "test.patient@example.com",
            "phone": "+1234567890",
            "date_of_birth": "1990-01-01",
            "gender": "Male",
            "password": "testpassword123"
        }

        response = client.post("/api/v1/auth/register", json=patient_data)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == patient_data["email"]
        assert data["role"] == "patient"

    def test_duplicate_patient_registration(self):
        """Test registration with duplicate email."""
        patient_data = {
            "first_name": "Test",
            "last_name": "Patient",
            "email": "test.patient@example.com",  # Same email as above
            "phone": "+1234567891",
            "date_of_birth": "1990-01-01",
            "gender": "Male",
            "password": "testpassword123"
        }

        response = client.post("/api/v1/auth/register", json=patient_data)
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_patient_login(self):
        """Test patient login."""
        login_data = {
            "email": "test.patient@example.com",
            "password": "testpassword123"
        }

        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == login_data["email"]

    def test_invalid_login(self):
        """Test login with invalid credentials."""
        login_data = {
            "email": "test.patient@example.com",
            "password": "wrongpassword"
        }

        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_protected_endpoint_without_token(self):
        """Test accessing protected endpoint without token."""
        response = client.get("/api/v1/patients/profile")
        assert response.status_code == 401

    def test_protected_endpoint_with_token(self):
        """Test accessing protected endpoint with valid token."""
        # First login to get token
        login_data = {
            "email": "test.patient@example.com",
            "password": "testpassword123"
        }

        login_response = client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]

        # Access protected endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/patients/profile", headers=headers)
        assert response.status_code == 200

    def test_token_refresh(self):
        """Test token refresh."""
        # First login to get tokens
        login_data = {
            "email": "test.patient@example.com",
            "password": "testpassword123"
        }

        login_response = client.post("/api/v1/auth/login", json=login_data)
        refresh_token = login_response.json()["refresh_token"]

        # Refresh token
        refresh_data = {"refresh_token": refresh_token}
        response = client.post("/api/v1/auth/refresh", json=refresh_data)
        assert response.status_code == 200
        assert "access_token" in response.json()


if __name__ == "__main__":
    pytest.main([__file__])