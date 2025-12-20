from fastapi import HTTPException, status


class HospitalManagementException(Exception):
    """Base exception for Hospital Management System."""

    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundError(HospitalManagementException):
    """Exception raised when a resource is not found."""

    def __init__(self, resource: str, identifier: str = ""):
        message = f"{resource} not found"
        if identifier:
            message += f": {identifier}"
        super().__init__(message, status.HTTP_404_NOT_FOUND)


class DuplicateResourceError(HospitalManagementException):
    """Exception raised when trying to create a duplicate resource."""

    def __init__(self, resource: str, field: str, value: str):
        message = f"{resource} with {field} '{value}' already exists"
        super().__init__(message, status.HTTP_400_BAD_REQUEST)


class AuthenticationError(HospitalManagementException):
    """Exception raised for authentication errors."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class AuthorizationError(HospitalManagementException):
    """Exception raised for authorization errors."""

    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)


class ValidationError(HospitalManagementException):
    """Exception raised for validation errors."""

    def __init__(self, message: str = "Validation failed"):
        super().__init__(message, status.HTTP_400_BAD_REQUEST)


class DatabaseError(HospitalManagementException):
    """Exception raised for database errors."""

    def __init__(self, message: str = "Database operation failed"):
        super().__init__(message, status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExternalServiceError(HospitalManagementException):
    """Exception raised when external services are unavailable."""

    def __init__(self, service: str, message: str = "Service temporarily unavailable"):
        super().__init__(f"{service}: {message}", status.HTTP_503_SERVICE_UNAVAILABLE)