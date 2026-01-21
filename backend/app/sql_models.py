"""
SQLAlchemy ORM Models
Database models for all MedVision AI entities.
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Doctor(Base):
    """Doctor table - stores doctor credentials and verification info."""
    __tablename__ = "doctors"
    
    email = Column(String(255), primary_key=True, index=True)
    id = Column(String(50), unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    country = Column(String(100))
    registration_number = Column(String(50), nullable=False)
    specialization = Column(String(100))
    hospital = Column(String(255))
    phone = Column(String(50))
    
    # Verification
    verification_status = Column(String(20), default="pending")
    verification_score = Column(Float, default=0.0)
    verification_notes = Column(Text)
    documents = Column(JSON, default=list)
    
    # Metadata
    role = Column(String(20), default="doctor")
    is_demo_account = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    profile = relationship("DoctorProfile", back_populates="doctor", uselist=False)
    settings = relationship("DoctorSettings", back_populates="doctor", uselist=False)


class Patient(Base):
    """Patient table - stores patient account info."""
    __tablename__ = "patients"
    
    email = Column(String(255), primary_key=True, index=True)
    id = Column(String(50), unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(50))
    date_of_birth = Column(String(20))
    gender = Column(String(20))
    address = Column(Text)
    emergency_contact = Column(String(100))
    
    # Trust system
    role = Column(String(20), default="patient")
    trust_score = Column(Integer, default=50)
    no_show_count = Column(Integer, default=0)
    appointments_completed = Column(Integer, default=0)
    is_globally_banned = Column(Boolean, default=False)
    banned_by_doctors = Column(JSON, default=list)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DemoPatient(Base):
    """Demo patient data for AI analysis demos."""
    __tablename__ = "demo_patients"
    
    id = Column(String(50), primary_key=True)
    profile = Column(JSON)  # PatientProfile data
    scans = Column(JSON, default=list)
    labs = Column(JSON, default=list)
    treatments = Column(JSON, default=list)
    notes = Column(JSON, default=list)


class DoctorProfile(Base):
    """Extended doctor profile for social features."""
    __tablename__ = "doctor_profiles"
    
    doctor_id = Column(String(50), ForeignKey("doctors.id"), primary_key=True)
    bio = Column(Text)
    experience_years = Column(Integer)
    consultation_fee = Column(String(50))
    languages = Column(JSON, default=list)
    qualifications = Column(JSON, default=list)
    achievements = Column(JSON, default=list)
    profile_photo_url = Column(String(500))
    cover_photo_url = Column(String(500))
    
    # Social stats
    followers_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    posts_count = Column(Integer, default=0)
    profile_completion = Column(Integer, default=35)
    
    # Privacy settings (JSON)
    privacy_settings = Column(JSON, default=dict)
    avatar_style = Column(String(50))
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    doctor = relationship("Doctor", back_populates="profile")


class Follow(Base):
    """Follow relationships between doctors."""
    __tablename__ = "follows"
    
    id = Column(String(100), primary_key=True)
    follower_id = Column(String(50), index=True)
    following_id = Column(String(50), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Appointment(Base):
    """Appointments between patients and doctors."""
    __tablename__ = "appointments"
    
    id = Column(String(50), primary_key=True)
    patient_id = Column(String(50), index=True)
    doctor_id = Column(String(50), index=True)
    status = Column(String(20), default="pending")
    mode = Column(String(20))  # online/offline
    
    # Timing
    scheduled_time = Column(DateTime)
    patient_timezone = Column(String(50), default="Asia/Kolkata")
    doctor_timezone = Column(String(50), default="Asia/Kolkata")
    estimated_duration_mins = Column(Integer, default=15)
    
    # Queue management
    queue_number = Column(Integer)
    queue_date = Column(String(10))  # YYYY-MM-DD
    
    # Meeting details
    meet_link = Column(String(500))
    hospital_address = Column(Text)
    
    # Timestamps
    patient_joined_at = Column(DateTime)
    consultation_started_at = Column(DateTime)
    consultation_ended_at = Column(DateTime)
    
    # References
    patient_profile_id = Column(String(50))
    ai_conversation_id = Column(String(50))
    
    # Patient display info
    patient_name = Column(String(100))
    patient_age = Column(Integer)
    patient_gender = Column(String(20))
    chief_complaint = Column(Text)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cancelled_reason = Column(Text)
    notes = Column(Text)


class PatientProfileRecord(Base):
    """Patient profiles submitted for appointments."""
    __tablename__ = "patient_profiles"
    
    id = Column(String(50), primary_key=True)
    patient_id = Column(String(50), index=True)
    appointment_id = Column(String(50), index=True)
    
    # Profile data (stored as JSON for flexibility)
    basic_info = Column(JSON)
    chief_complaint = Column(JSON)
    medical_history = Column(JSON, default=list)
    family_history = Column(Text)
    lifestyle = Column(JSON)
    uploaded_documents = Column(JSON, default=list)
    questionnaire_responses = Column(JSON, default=dict)
    
    # AI fields
    ai_summary = Column(Text)
    token_count = Column(Integer, default=0)
    complexity_tier = Column(String(20), default="light")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DoctorSettings(Base):
    """Doctor appointment settings and preferences."""
    __tablename__ = "doctor_settings"
    
    doctor_id = Column(String(50), ForeignKey("doctors.id"), primary_key=True)
    
    # Availability
    accepts_online = Column(Boolean, default=True)
    accepts_offline = Column(Boolean, default=True)
    accepting_appointments_today = Column(Boolean, default=True)
    
    # Location
    hospital_name = Column(String(255))
    hospital_address = Column(Text)
    hospital_coordinates = Column(JSON)
    
    # Timing
    consultation_duration_mins = Column(Integer, default=15)
    threshold_wait_mins = Column(Integer, default=10)
    max_patients_per_day = Column(Integer, default=30)
    working_hours_start = Column(String(10), default="09:00")
    working_hours_end = Column(String(10), default="18:00")
    timezone = Column(String(50), default="Asia/Kolkata")
    break_times = Column(JSON, default=list)
    
    # Fees
    online_consultation_fee = Column(Float)
    offline_consultation_fee = Column(Float)
    custom_meet_link = Column(String(500))
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    doctor = relationship("Doctor", back_populates="settings")


class PatientReputation(Base):
    """Patient behavior tracking for trust system."""
    __tablename__ = "patient_reputations"
    
    patient_id = Column(String(50), primary_key=True)
    
    # Stats
    total_appointments = Column(Integer, default=0)
    completed_appointments = Column(Integer, default=0)
    no_show_count = Column(Integer, default=0)
    late_arrivals = Column(Integer, default=0)
    reputation_score = Column(Integer, default=50)
    
    # Verification
    is_phone_verified = Column(Boolean, default=False)
    is_email_verified = Column(Boolean, default=False)
    
    # Moderation
    is_suspended = Column(Boolean, default=False)
    suspension_until = Column(DateTime)
    flags = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
