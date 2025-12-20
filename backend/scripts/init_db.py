"""Initialize database with tables and seed data."""
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.database import engine, Base
from app.models import *
from app.core.security import get_password_hash
from sqlalchemy.orm import Session


def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")


def create_admin_user():
    """Create default admin user."""
    print("Creating default admin user...")

    db = Session(engine)

    try:
        # Check if admin user already exists
        from app.models.user import User, UserRole
        existing_admin = db.query(User).filter(User.email == "admin@hospital.com").first()

        if not existing_admin:
            admin_user = User(
                email="admin@hospital.com",
                password_hash=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )

            db.add(admin_user)
            db.commit()
            print("Default admin user created successfully!")
            print("Email: admin@hospital.com")
            print("Password: admin123")
        else:
            print("Admin user already exists!")

    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """Main initialization function."""
    print("Initializing Hospital Management System Database...")
    print("=" * 50)

    create_tables()
    create_admin_user()

    print("=" * 50)
    print("Database initialization completed!")


if __name__ == "__main__":
    main()