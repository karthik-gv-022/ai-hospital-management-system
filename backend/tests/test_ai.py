"""Tests for AI/ML endpoints."""
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestAIEndpoints:
    """Test AI and ML endpoints."""

    def test_ai_health_check(self):
        """Test AI service health check."""
        response = client.get("/api/v1/ai/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "ai_service_initialized" in data

    def test_doctor_recommendations_unauthorized(self):
        """Test doctor recommendations without authentication."""
        request_data = {
            "symptoms": "chest pain",
            "preferred_date": "2024-01-15",
            "preferred_specialization": "Cardiology"
        }

        response = client.post("/api/v1/ai/recommend-doctor", json=request_data)
        assert response.status_code == 401

    def test_wait_time_prediction_unauthorized(self):
        """Test wait time prediction without authentication."""
        request_data = {
            "doctor_id": "test-doctor-id",
            "appointment_date": "2024-01-15",
            "appointment_time": "10:30:00"
        }

        response = client.post("/api/v1/ai/predict-wait-time", json=request_data)
        assert response.status_code == 401

    def test_invalid_time_format(self):
        """Test wait time prediction with invalid time format."""
        # First login to get token
        login_data = {
            "email": "test.patient@example.com",
            "password": "testpassword123"
        }

        login_response = client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]

        # Test with invalid time format
        request_data = {
            "doctor_id": "test-doctor-id",
            "appointment_date": "2024-01-15",
            "appointment_time": "invalid-time"
        }

        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/ai/predict-wait-time", json=request_data, headers=headers)
        assert response.status_code == 422  # Validation error

    def test_model_status_unauthorized(self):
        """Test model status endpoint without admin authentication."""
        response = client.get("/api/v1/ai/model-status")
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__])