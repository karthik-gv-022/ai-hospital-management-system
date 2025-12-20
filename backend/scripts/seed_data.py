"""Seed database with sample data for development and testing."""
import sys
import os
from datetime import date, time, datetime
from decimal import Decimal

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.database import engine, Base
from app.models import *
from app.core.security import get_password_hash
from sqlalchemy.orm import Session


def seed_sample_data():
    """Seed database with sample data."""
    print("Seeding sample data...")

    db = Session(engine)

    try:
        # Create sample doctors
        doctors_data = [
            {
                "first_name": "John",
                "last_name": "Smith",
                "email": "dr.smith@hospital.com",
                "phone": "+91-9876543210",
                "specialization": "Cardiology",
                "department": "Cardiology",
                "license_number": "TN-MD-12345",
                "experience_years": 15,
                "consultation_fee": Decimal("150.00"),
                "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday"],
                "available_time_start": time(9, 0),
                "available_time_end": time(17, 0),
                "max_patients_per_day": 20
            },
            {
                "first_name": "Sarah",
                "last_name": "Johnson",
                "email": "dr.johnson@hospital.com",
                "phone": "+91-9876543211",
                "specialization": "Pediatrics",
                "department": "Pediatrics",
                "license_number": "TN-MD-67890",
                "experience_years": 10,
                "consultation_fee": Decimal("120.00"),
                "available_days": ["Monday", "Wednesday", "Friday"],
                "available_time_start": time(8, 30),
                "available_time_end": time(16, 30),
                "max_patients_per_day": 25
            },
            {
                "first_name": "Michael",
                "last_name": "Williams",
                "email": "dr.williams@hospital.com",
                "phone": "+91-9876543212",
                "specialization": "Orthopedics",
                "department": "Orthopedics",
                "license_number": "TN-MD-24680",
                "experience_years": 12,
                "consultation_fee": Decimal("180.00"),
                "available_days": ["Tuesday", "Thursday", "Saturday"],
                "available_time_start": time(10, 0),
                "available_time_end": time(18, 0),
                "max_patients_per_day": 15
            }
        ]

        for doctor_data in doctors_data:
            # Check if doctor already exists
            existing_doctor = db.query(Doctor).filter(Doctor.email == doctor_data["email"]).first()
            if not existing_doctor:
                doctor = Doctor(**doctor_data)
                db.add(doctor)

                # Create corresponding user account
                user = User(
                    email=doctor_data["email"],
                    password_hash=get_password_hash("doctor123"),
                    role=UserRole.DOCTOR,
                    is_active=True
                )
                db.add(user)

        db.commit()
        print("Sample doctors created successfully!")

        # Create sample patients
        patients_data = [
            {
                "first_name": "Alice",
                "last_name": "Brown",
                "email": "alice.brown@email.com",
                "phone": "+91-9876543210",
                "date_of_birth": date(1985, 5, 15),
                "gender": Gender.FEMALE,
                "address": "123 Anna Salai, T. Nagar, Chennai, Tamil Nadu - 600017",
                "emergency_contact_name": "Bob Brown",
                "emergency_contact_phone": "+91-9876543211",
                "blood_group": BloodGroup.A_POSITIVE
            },
            {
                "first_name": "Robert",
                "last_name": "Davis",
                "email": "robert.davis@email.com",
                "phone": "+91-9876543212",
                "date_of_birth": date(1990, 8, 22),
                "gender": Gender.MALE,
                "address": "456 Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu - 641004",
                "emergency_contact_name": "Mary Davis",
                "emergency_contact_phone": "+91-9876543213",
                "blood_group": BloodGroup.O_POSITIVE
            },
            {
                "first_name": "Emily",
                "last_name": "Wilson",
                "email": "emily.wilson@email.com",
                "phone": "+91-9876543214",
                "date_of_birth": date(1988, 3, 10),
                "gender": Gender.FEMALE,
                "address": "789 Kamarajar Salai, Madurai Main, Madurai, Tamil Nadu - 625001",
                "emergency_contact_name": "David Wilson",
                "emergency_contact_phone": "+91-9876543215",
                "blood_group": BloodGroup.B_POSITIVE
            }
        ]

        for patient_data in patients_data:
            # Check if patient already exists
            existing_patient = db.query(Patient).filter(Patient.email == patient_data["email"]).first()
            if not existing_patient:
                patient = Patient(**patient_data)
                db.add(patient)

                # Create corresponding user account
                user = User(
                    email=patient_data["email"],
                    password_hash=get_password_hash("patient123"),
                    role=UserRole.PATIENT,
                    is_active=True
                )
                db.add(user)

        db.commit()
        print("Sample patients created successfully!")

        print("Sample data seeding completed!")
        print("\nLogin Credentials:")
        print("Admin: admin@hospital.com / admin123")
        print("Doctor 1: dr.smith@hospital.com / doctor123")
        print("Doctor 2: dr.johnson@hospital.com / doctor123")
        print("Doctor 3: dr.williams@hospital.com / doctor123")
        print("Patient 1: alice.brown@email.com / patient123")
        print("Patient 2: robert.davis@email.com / patient123")
        print("Patient 3: emily.wilson@email.com / patient123")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """Main seeding function."""
    print("Seeding Hospital Management System with Sample Data...")
    print("=" * 60)

    seed_sample_data()

    print("=" * 60)
    print("Sample data seeding completed!")


if __name__ == "__main__":
    main()