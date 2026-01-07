"""
Authentication service for handling login, registration, and JWT tokens.
"""

import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict
import jwt

from app.models.user import (
    DoctorCreate,
    DoctorInDB,
    DoctorResponse,
    LoginRequest,
    LoginResponse,
    TokenPayload,
    VerificationStatus,
    UserRole,
    DEMO_ACCOUNTS,
    TEST_EMAIL_DOMAINS,
    MAGIC_VERIFICATION_CODE
)

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "medvision-ai-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# In-memory storage (replace with Firebase in production)
doctors_db: Dict[str, DoctorInDB] = {}


def hash_password(password: str) -> str:
    """Hash password using SHA256 with salt."""
    salt = "medvision_salt_2025"
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return hash_password(plain_password) == hashed_password


def create_access_token(user_id: str, email: str, role: UserRole) -> str:
    """Create JWT access token."""
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role.value,
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> Optional[TokenPayload]:
    """Verify and decode JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenPayload(
            sub=payload["sub"],
            email=payload["email"],
            role=UserRole(payload["role"]),
            exp=datetime.fromtimestamp(payload["exp"])
        )
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def is_demo_email(email: str) -> bool:
    """Check if email is a demo/test email that should auto-approve."""
    # Check demo accounts
    if email in DEMO_ACCOUNTS:
        return True
    
    # Check test email domains
    domain = email.split("@")[-1] if "@" in email else ""
    if domain in TEST_EMAIL_DOMAINS:
        return True
    
    return False


def get_demo_account(email: str) -> Optional[DoctorInDB]:
    """Get demo account if email matches."""
    if email in DEMO_ACCOUNTS:
        data = DEMO_ACCOUNTS[email]
        return DoctorInDB(
            id=data["id"],
            email=email,
            password_hash=hash_password("Demo@2025"),  # Demo password
            name=data["name"],
            country=data["country"],
            registration_number=data["registration_number"],
            specialization=data["specialization"],
            hospital=data["hospital"],
            verification_status=VerificationStatus.APPROVED,
            verification_score=100.0,
            is_demo_account=True
        )
    return None


def register_doctor(data: DoctorCreate, magic_code: Optional[str] = None) -> DoctorInDB:
    """Register a new doctor."""
    # Check if email already exists
    if data.email in doctors_db:
        raise ValueError("Email already registered")
    
    # Check if it's a demo account
    demo = get_demo_account(data.email)
    if demo:
        doctors_db[data.email] = demo
        return demo
    
    # Validate passwords match
    if data.password != data.confirm_password:
        raise ValueError("Passwords do not match")
    
    # Determine verification status
    verification_status = VerificationStatus.PENDING
    verification_score = 0.0
    
    # Auto-approve for test emails or magic code
    if is_demo_email(data.email):
        verification_status = VerificationStatus.APPROVED
        verification_score = 100.0
    elif magic_code == MAGIC_VERIFICATION_CODE:
        verification_status = VerificationStatus.APPROVED
        verification_score = 100.0
    
    # Create doctor record
    doctor_id = f"doc_{secrets.token_hex(8)}"
    doctor = DoctorInDB(
        id=doctor_id,
        email=data.email,
        password_hash=hash_password(data.password),
        name=data.name,
        country=data.country,
        registration_number=data.registration_number,
        specialization=data.specialization,
        hospital=data.hospital,
        verification_status=verification_status,
        verification_score=verification_score,
        is_demo_account=False
    )
    
    doctors_db[data.email] = doctor
    return doctor


def login_doctor(data: LoginRequest) -> LoginResponse:
    """Authenticate doctor and return token."""
    # Check demo accounts first
    if data.email in DEMO_ACCOUNTS:
        demo = get_demo_account(data.email)
        if demo and data.password == "Demo@2025":
            doctors_db[data.email] = demo
            token = create_access_token(demo.id, demo.email, UserRole.DOCTOR)
            return LoginResponse(
                access_token=token,
                user=DoctorResponse(
                    id=demo.id,
                    email=demo.email,
                    name=demo.name,
                    country=demo.country,
                    registration_number=demo.registration_number,
                    specialization=demo.specialization,
                    hospital=demo.hospital,
                    verification_status=demo.verification_status,
                    role=UserRole.DOCTOR,
                    created_at=demo.created_at
                )
            )
    
    # Check registered doctors
    doctor = doctors_db.get(data.email)
    if not doctor:
        raise ValueError("Invalid email or password")
    
    if not verify_password(data.password, doctor.password_hash):
        raise ValueError("Invalid email or password")
    
    # Create token
    token = create_access_token(doctor.id, doctor.email, UserRole.DOCTOR)
    
    return LoginResponse(
        access_token=token,
        user=DoctorResponse(
            id=doctor.id,
            email=doctor.email,
            name=doctor.name,
            country=doctor.country,
            registration_number=doctor.registration_number,
            specialization=doctor.specialization,
            hospital=doctor.hospital,
            verification_status=doctor.verification_status,
            role=UserRole.DOCTOR,
            created_at=doctor.created_at
        )
    )


def get_doctor_by_id(doctor_id: str) -> Optional[DoctorInDB]:
    """Get doctor by ID."""
    for doctor in doctors_db.values():
        if doctor.id == doctor_id:
            return doctor
    return None


def get_doctor_by_email(email: str) -> Optional[DoctorInDB]:
    """Get doctor by email."""
    return doctors_db.get(email)


def update_verification_status(
    doctor_id: str, 
    status: VerificationStatus, 
    score: float,
    notes: Optional[str] = None
) -> Optional[DoctorInDB]:
    """Update doctor verification status."""
    doctor = get_doctor_by_id(doctor_id)
    if doctor:
        doctor.verification_status = status
        doctor.verification_score = score
        doctor.verification_notes = notes
        doctor.updated_at = datetime.utcnow()
        doctors_db[doctor.email] = doctor
        return doctor
    return None


# Initialize demo accounts on module load
for email, data in DEMO_ACCOUNTS.items():
    demo = get_demo_account(email)
    if demo:
        doctors_db[email] = demo
