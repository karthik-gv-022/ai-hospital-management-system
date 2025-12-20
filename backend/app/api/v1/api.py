from fastapi import APIRouter
from app.api.v1.endpoints import auth, patients, doctors, appointments, tokens, admin, ai

api_router = APIRouter()

# Include authentication endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Include patient endpoints
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])

# Include doctor endpoints
api_router.include_router(doctors.router, prefix="/doctors", tags=["doctors"])

# Include appointment endpoints
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])

# Include token endpoints
api_router.include_router(tokens.router, prefix="/tokens", tags=["tokens"])

# Include admin endpoints
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

# Include AI endpoints
api_router.include_router(ai.router, prefix="/ai", tags=["ai", "machine-learning"])