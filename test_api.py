#!/usr/bin/env python3
"""
Simple test file to verify API structure
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Doctor Management Healthcare Platform API",
    version="1.0.0",
    description="Doctor Management Healthcare Platform API - Serving Tamil Nadu",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Doctor Management Healthcare Platform API - Tamil Nadu",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Basic auth endpoints for testing
@app.post("/api/v1/auth/login")
async def login():
    return {
        "access_token": "test_token",
        "refresh_token": "test_refresh",
        "token_type": "bearer",
        "user": {
            "id": "test-id",
            "email": "admin@hospital.com",
            "role": "admin",
            "first_name": "Admin",
            "last_name": "User"
        }
    }

@app.post("/api/v1/auth/register")
async def register():
    return {"message": "User registered successfully"}

@app.get("/api/v1/doctors")
async def get_doctors():
    return {
        "doctors": [
            {
                "id": "1",
                "first_name": "John",
                "last_name": "Smith",
                "specialization": "Cardiology",
                "department": "Cardiology"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting Doctor Management Healthcare Platform API...")
    print("API Documentation will be available at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)