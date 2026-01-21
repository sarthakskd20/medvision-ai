"""
Database Service
SQLite database operations for MedVision AI.
Drop-in replacement for firebase_service.py with identical interface.
"""

from typing import Optional, Dict, List
from datetime import datetime
from sqlalchemy.orm import Session

from app.database import SessionLocal, init_db
from app.sql_models import (
    Doctor, Patient, DemoPatient, DoctorProfile, Follow,
    Appointment, PatientProfileRecord, DoctorSettings, PatientReputation
)


# Initialize database on module load
init_db()


class DatabaseService:
    """Service for SQLite database operations."""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def _get_session(self) -> Session:
        """Get a new database session."""
        return SessionLocal()
    
    @property
    def is_connected(self) -> bool:
        """Check if database is connected."""
        return True  # SQLite is always available
    
    # ===========================================
    # DOCTOR OPERATIONS
    # ===========================================
    
    async def create_doctor(self, doctor_data: dict) -> dict:
        """Create a new doctor in database."""
        session = self._get_session()
        try:
            # Convert datetime to string if needed
            data = {**doctor_data}
            for key in ["created_at", "updated_at"]:
                if key in data and isinstance(data[key], datetime):
                    data[key] = data[key].isoformat()
            
            doctor = Doctor(
                email=data.get("email"),
                id=data.get("id"),
                password_hash=data.get("password_hash"),
                name=data.get("name"),
                country=data.get("country"),
                registration_number=data.get("registration_number"),
                specialization=data.get("specialization"),
                hospital=data.get("hospital"),
                phone=data.get("phone"),
                verification_status=data.get("verification_status", "pending"),
                verification_score=data.get("verification_score", 0.0),
                verification_notes=data.get("verification_notes"),
                documents=data.get("documents", []),
                role=data.get("role", "doctor"),
                is_demo_account=data.get("is_demo_account", False)
            )
            session.add(doctor)
            session.commit()
            return doctor_data
        finally:
            session.close()
    
    async def get_doctor_by_email(self, email: str) -> Optional[dict]:
        """Get doctor by email from database."""
        session = self._get_session()
        try:
            doctor = session.query(Doctor).filter(Doctor.email == email).first()
            if doctor:
                return self._doctor_to_dict(doctor)
            return None
        finally:
            session.close()
    
    async def get_doctor_by_id(self, doctor_id: str) -> Optional[dict]:
        """Get doctor by ID from database."""
        session = self._get_session()
        try:
            doctor = session.query(Doctor).filter(Doctor.id == doctor_id).first()
            if doctor:
                return self._doctor_to_dict(doctor)
            return None
        finally:
            session.close()
    
    async def update_doctor(self, email: str, updates: dict) -> Optional[dict]:
        """Update doctor data in database."""
        session = self._get_session()
        try:
            doctor = session.query(Doctor).filter(Doctor.email == email).first()
            if not doctor:
                return None
            
            for key, value in updates.items():
                if hasattr(doctor, key):
                    setattr(doctor, key, value)
            
            doctor.updated_at = datetime.utcnow()
            session.commit()
            return self._doctor_to_dict(doctor)
        finally:
            session.close()
    
    async def doctor_exists(self, email: str) -> bool:
        """Check if doctor with email exists."""
        session = self._get_session()
        try:
            return session.query(Doctor).filter(Doctor.email == email).count() > 0
        finally:
            session.close()
    
    def _doctor_to_dict(self, doctor: Doctor) -> dict:
        """Convert Doctor model to dictionary."""
        return {
            "email": doctor.email,
            "id": doctor.id,
            "password_hash": doctor.password_hash,
            "name": doctor.name,
            "country": doctor.country,
            "registration_number": doctor.registration_number,
            "specialization": doctor.specialization,
            "hospital": doctor.hospital,
            "phone": doctor.phone,
            "verification_status": doctor.verification_status,
            "verification_score": doctor.verification_score,
            "verification_notes": doctor.verification_notes,
            "documents": doctor.documents or [],
            "role": doctor.role,
            "is_demo_account": doctor.is_demo_account,
            "created_at": doctor.created_at.isoformat() if doctor.created_at else None,
            "updated_at": doctor.updated_at.isoformat() if doctor.updated_at else None
        }
    
    # ===========================================
    # PATIENT OPERATIONS
    # ===========================================
    
    async def create_patient(self, patient_data: dict) -> dict:
        """Create a new patient in database."""
        session = self._get_session()
        try:
            data = {**patient_data}
            patient = Patient(
                email=data.get("email"),
                id=data.get("id"),
                password_hash=data.get("password_hash"),
                name=data.get("name"),
                phone=data.get("phone"),
                date_of_birth=data.get("date_of_birth"),
                gender=data.get("gender"),
                address=data.get("address"),
                emergency_contact=data.get("emergency_contact"),
                role=data.get("role", "patient"),
                trust_score=data.get("trust_score", 50),
                no_show_count=data.get("no_show_count", 0),
                appointments_completed=data.get("appointments_completed", 0),
                is_globally_banned=data.get("is_globally_banned", False),
                banned_by_doctors=data.get("banned_by_doctors", [])
            )
            session.add(patient)
            session.commit()
            return patient_data
        finally:
            session.close()
    
    async def get_patient_by_email(self, email: str) -> Optional[dict]:
        """Get patient by email from database."""
        session = self._get_session()
        try:
            patient = session.query(Patient).filter(Patient.email == email).first()
            if patient:
                return self._patient_to_dict(patient)
            return None
        finally:
            session.close()
    
    async def get_patient_by_id(self, patient_id: str) -> Optional[dict]:
        """Get patient by ID from database."""
        session = self._get_session()
        try:
            patient = session.query(Patient).filter(Patient.id == patient_id).first()
            if patient:
                return self._patient_to_dict(patient)
            return None
        finally:
            session.close()
    
    async def update_patient(self, email: str, updates: dict) -> Optional[dict]:
        """Update patient data in database."""
        session = self._get_session()
        try:
            patient = session.query(Patient).filter(Patient.email == email).first()
            if not patient:
                return None
            
            for key, value in updates.items():
                if hasattr(patient, key):
                    setattr(patient, key, value)
            
            patient.updated_at = datetime.utcnow()
            session.commit()
            return self._patient_to_dict(patient)
        finally:
            session.close()
    
    async def patient_exists(self, email: str) -> bool:
        """Check if patient with email exists."""
        session = self._get_session()
        try:
            return session.query(Patient).filter(Patient.email == email).count() > 0
        finally:
            session.close()
    
    async def get_all_patients(self, limit: int = 100) -> List[dict]:
        """Get all patients from database."""
        session = self._get_session()
        try:
            patients = session.query(Patient).limit(limit).all()
            return [self._patient_to_dict(p) for p in patients]
        finally:
            session.close()
    
    def _patient_to_dict(self, patient: Patient) -> dict:
        """Convert Patient model to dictionary."""
        return {
            "email": patient.email,
            "id": patient.id,
            "password_hash": patient.password_hash,
            "name": patient.name,
            "phone": patient.phone,
            "date_of_birth": patient.date_of_birth,
            "gender": patient.gender,
            "address": patient.address,
            "emergency_contact": patient.emergency_contact,
            "role": patient.role,
            "trust_score": patient.trust_score,
            "no_show_count": patient.no_show_count,
            "appointments_completed": patient.appointments_completed,
            "is_globally_banned": patient.is_globally_banned,
            "banned_by_doctors": patient.banned_by_doctors or [],
            "created_at": patient.created_at.isoformat() if patient.created_at else None,
            "updated_at": patient.updated_at.isoformat() if patient.updated_at else None
        }
    
    # ===========================================
    # DEMO PATIENT DATA
    # ===========================================
    
    async def get_demo_patients(self) -> List[dict]:
        """Get demo patients for AI analysis demo."""
        session = self._get_session()
        try:
            demos = session.query(DemoPatient).all()
            if not demos:
                return [DEMO_PATIENT_SARAH]
            return [self._demo_patient_to_dict(d) for d in demos]
        finally:
            session.close()
    
    async def get_demo_patient(self, patient_id: str) -> Optional[dict]:
        """Get a specific demo patient."""
        session = self._get_session()
        try:
            demo = session.query(DemoPatient).filter(DemoPatient.id == patient_id).first()
            if demo:
                return self._demo_patient_to_dict(demo)
            if patient_id == "patient_sarah_001":
                return DEMO_PATIENT_SARAH
            return None
        finally:
            session.close()
    
    def _demo_patient_to_dict(self, demo: DemoPatient) -> dict:
        """Convert DemoPatient to dictionary."""
        return {
            "id": demo.id,
            "profile": demo.profile,
            "scans": demo.scans or [],
            "labs": demo.labs or [],
            "treatments": demo.treatments or []
        }
    
    # ===========================================
    # SOCIAL / PROFILE OPERATIONS
    # ===========================================
    
    async def get_doctor_profile(self, doctor_id: str) -> Optional[dict]:
        """Get extended profile for doctor."""
        session = self._get_session()
        try:
            profile = session.query(DoctorProfile).filter(DoctorProfile.doctor_id == doctor_id).first()
            if profile:
                return self._profile_to_dict(profile)
            return None
        finally:
            session.close()
    
    async def update_doctor_profile(self, doctor_id: str, profile_data: dict) -> dict:
        """Update extended profile for doctor."""
        session = self._get_session()
        try:
            profile = session.query(DoctorProfile).filter(DoctorProfile.doctor_id == doctor_id).first()
            
            if profile:
                for key, value in profile_data.items():
                    if hasattr(profile, key):
                        setattr(profile, key, value)
            else:
                profile = DoctorProfile(doctor_id=doctor_id, **profile_data)
                session.add(profile)
            
            session.commit()
            return profile_data
        finally:
            session.close()
    
    async def create_follow(self, follow_data: dict) -> dict:
        """Create a follow relationship."""
        session = self._get_session()
        try:
            follow = Follow(
                id=follow_data["id"],
                follower_id=follow_data["follower_id"],
                following_id=follow_data["following_id"]
            )
            session.add(follow)
            session.commit()
            return follow_data
        finally:
            session.close()
    
    async def delete_follow(self, follower_id: str, following_id: str) -> bool:
        """Delete a follow relationship."""
        session = self._get_session()
        try:
            deleted = session.query(Follow).filter(
                Follow.follower_id == follower_id,
                Follow.following_id == following_id
            ).delete()
            session.commit()
            return deleted > 0
        finally:
            session.close()
    
    async def is_following(self, follower_id: str, following_id: str) -> bool:
        """Check if one doctor follows another."""
        session = self._get_session()
        try:
            return session.query(Follow).filter(
                Follow.follower_id == follower_id,
                Follow.following_id == following_id
            ).count() > 0
        finally:
            session.close()
    
    async def get_followers(self, doctor_id: str, limit: int = 20) -> list:
        """Get list of followers for a doctor."""
        session = self._get_session()
        try:
            follows = session.query(Follow).filter(Follow.following_id == doctor_id).limit(limit).all()
            followers = []
            for f in follows:
                follower = await self.get_doctor_by_id(f.follower_id)
                if follower:
                    followers.append({
                        'id': f.follower_id,
                        'name': follower.get('name', 'Doctor'),
                        'specialization': follower.get('specialization', ''),
                        'profile_photo': None
                    })
            return followers
        finally:
            session.close()
    
    async def get_following(self, doctor_id: str, limit: int = 20) -> list:
        """Get list of doctors that a doctor is following."""
        session = self._get_session()
        try:
            follows = session.query(Follow).filter(Follow.follower_id == doctor_id).limit(limit).all()
            following = []
            for f in follows:
                followed = await self.get_doctor_by_id(f.following_id)
                if followed:
                    following.append({
                        'id': f.following_id,
                        'name': followed.get('name', 'Doctor'),
                        'specialization': followed.get('specialization', ''),
                        'profile_photo': None
                    })
            return following
        finally:
            session.close()
    
    async def increment_follower_count(self, doctor_id: str):
        """Increment follower count for a doctor."""
        session = self._get_session()
        try:
            profile = session.query(DoctorProfile).filter(DoctorProfile.doctor_id == doctor_id).first()
            if profile:
                profile.followers_count = (profile.followers_count or 0) + 1
            else:
                profile = DoctorProfile(doctor_id=doctor_id, followers_count=1)
                session.add(profile)
            session.commit()
        finally:
            session.close()
    
    async def decrement_follower_count(self, doctor_id: str):
        """Decrement follower count for a doctor."""
        session = self._get_session()
        try:
            profile = session.query(DoctorProfile).filter(DoctorProfile.doctor_id == doctor_id).first()
            if profile:
                profile.followers_count = max(0, (profile.followers_count or 0) - 1)
                session.commit()
        finally:
            session.close()
    
    async def increment_following_count(self, doctor_id: str):
        """Increment following count for a doctor."""
        session = self._get_session()
        try:
            profile = session.query(DoctorProfile).filter(DoctorProfile.doctor_id == doctor_id).first()
            if profile:
                profile.following_count = (profile.following_count or 0) + 1
            else:
                profile = DoctorProfile(doctor_id=doctor_id, following_count=1)
                session.add(profile)
            session.commit()
        finally:
            session.close()
    
    async def decrement_following_count(self, doctor_id: str):
        """Decrement following count for a doctor."""
        session = self._get_session()
        try:
            profile = session.query(DoctorProfile).filter(DoctorProfile.doctor_id == doctor_id).first()
            if profile:
                profile.following_count = max(0, (profile.following_count or 0) - 1)
                session.commit()
        finally:
            session.close()
    
    async def get_suggested_doctors(self, current_id: str, specialization: str, limit: int = 10) -> list:
        """Get suggested doctors to follow based on specialization."""
        session = self._get_session()
        try:
            doctors = session.query(Doctor).filter(
                Doctor.specialization == specialization,
                Doctor.id != current_id
            ).limit(limit + 10).all()
            
            suggestions = []
            for d in doctors:
                if await self.is_following(current_id, d.id):
                    continue
                suggestions.append({
                    'id': d.id,
                    'name': d.name,
                    'specialization': d.specialization,
                    'hospital': d.hospital,
                    'verification_status': d.verification_status
                })
                if len(suggestions) >= limit:
                    break
            return suggestions
        finally:
            session.close()
    
    def _profile_to_dict(self, profile: DoctorProfile) -> dict:
        """Convert DoctorProfile to dictionary."""
        return {
            "doctor_id": profile.doctor_id,
            "bio": profile.bio,
            "experience_years": profile.experience_years,
            "consultation_fee": profile.consultation_fee,
            "languages": profile.languages or [],
            "qualifications": profile.qualifications or [],
            "achievements": profile.achievements or [],
            "profile_photo_url": profile.profile_photo_url,
            "cover_photo_url": profile.cover_photo_url,
            "followers_count": profile.followers_count or 0,
            "following_count": profile.following_count or 0,
            "posts_count": profile.posts_count or 0,
            "profile_completion": profile.profile_completion or 35,
            "privacy_settings": profile.privacy_settings or {},
            "avatar_style": profile.avatar_style
        }
    
    # ===========================================
    # APPOINTMENT OPERATIONS
    # ===========================================
    
    def create_appointment(self, appointment_data: dict) -> dict:
        """Create a new appointment in database."""
        session = self._get_session()
        try:
            data = {**appointment_data}
            # Convert datetime fields
            for key in ["scheduled_time", "created_at", "updated_at", "consultation_started_at",
                        "consultation_ended_at", "patient_joined_at"]:
                if key in data and data[key] is not None and hasattr(data[key], 'isoformat'):
                    data[key] = data[key]
            
            appointment = Appointment(
                id=data.get("id"),
                patient_id=data.get("patient_id"),
                doctor_id=data.get("doctor_id"),
                status=data.get("status", "pending"),
                mode=data.get("mode"),
                scheduled_time=data.get("scheduled_time"),
                patient_timezone=data.get("patient_timezone", "Asia/Kolkata"),
                doctor_timezone=data.get("doctor_timezone", "Asia/Kolkata"),
                estimated_duration_mins=data.get("estimated_duration_mins", 15),
                queue_number=data.get("queue_number"),
                queue_date=data.get("queue_date"),
                meet_link=data.get("meet_link"),
                hospital_address=data.get("hospital_address"),
                patient_profile_id=data.get("patient_profile_id"),
                ai_conversation_id=data.get("ai_conversation_id"),
                patient_name=data.get("patient_name"),
                patient_age=data.get("patient_age"),
                patient_gender=data.get("patient_gender"),
                chief_complaint=data.get("chief_complaint"),
                notes=data.get("notes")
            )
            session.add(appointment)
            session.commit()
            return appointment_data
        finally:
            session.close()
    
    def get_appointment_by_id(self, appointment_id: str) -> Optional[dict]:
        """Get appointment by ID from database."""
        session = self._get_session()
        try:
            appointment = session.query(Appointment).filter(Appointment.id == appointment_id).first()
            if appointment:
                return self._appointment_to_dict(appointment)
            return None
        finally:
            session.close()
    
    def get_appointments_by_patient(self, patient_id: str, status: Optional[str] = None) -> List[dict]:
        """Get all appointments for a patient."""
        session = self._get_session()
        try:
            query = session.query(Appointment).filter(Appointment.patient_id == patient_id)
            if status:
                query = query.filter(Appointment.status == status)
            appointments = query.order_by(Appointment.scheduled_time.desc()).all()
            return [self._appointment_to_dict(a) for a in appointments]
        finally:
            session.close()
    
    def get_appointments_by_doctor_date(self, doctor_id: str, date: str) -> List[dict]:
        """Get all appointments for a doctor on a specific date."""
        session = self._get_session()
        try:
            appointments = session.query(Appointment).filter(
                Appointment.doctor_id == doctor_id,
                Appointment.queue_date == date
            ).all()
            return [self._appointment_to_dict(a) for a in appointments]
        finally:
            session.close()
    
    def has_active_appointment_with_doctor(self, patient_id: str, doctor_id: str) -> bool:
        """Check if patient has an active appointment with this doctor."""
        session = self._get_session()
        try:
            active_statuses = ["pending", "confirmed", "in_progress"]
            count = session.query(Appointment).filter(
                Appointment.patient_id == patient_id,
                Appointment.doctor_id == doctor_id,
                Appointment.status.in_(active_statuses)
            ).count()
            return count > 0
        finally:
            session.close()
    
    def update_appointment(self, appointment_id: str, updates: dict) -> Optional[dict]:
        """Update appointment data in database."""
        session = self._get_session()
        try:
            appointment = session.query(Appointment).filter(Appointment.id == appointment_id).first()
            if not appointment:
                return None
            
            for key, value in updates.items():
                if hasattr(appointment, key):
                    setattr(appointment, key, value)
            
            appointment.updated_at = datetime.utcnow()
            session.commit()
            return self._appointment_to_dict(appointment)
        finally:
            session.close()
    
    def create_patient_profile(self, profile_data: dict) -> dict:
        """Create patient profile for an appointment."""
        session = self._get_session()
        try:
            profile = PatientProfileRecord(
                id=profile_data.get("id"),
                patient_id=profile_data.get("patient_id"),
                appointment_id=profile_data.get("appointment_id"),
                basic_info=profile_data.get("basic_info"),
                chief_complaint=profile_data.get("chief_complaint"),
                medical_history=profile_data.get("medical_history", []),
                family_history=profile_data.get("family_history"),
                lifestyle=profile_data.get("lifestyle"),
                uploaded_documents=profile_data.get("uploaded_documents", []),
                questionnaire_responses=profile_data.get("questionnaire_responses", {}),
                ai_summary=profile_data.get("ai_summary"),
                token_count=profile_data.get("token_count", 0),
                complexity_tier=profile_data.get("complexity_tier", "light")
            )
            session.add(profile)
            session.commit()
            return profile_data
        finally:
            session.close()
    
    def get_doctor_settings(self, doctor_id: str) -> Optional[dict]:
        """Get doctor's appointment settings."""
        session = self._get_session()
        try:
            settings = session.query(DoctorSettings).filter(DoctorSettings.doctor_id == doctor_id).first()
            if settings:
                return self._settings_to_dict(settings)
            return None
        finally:
            session.close()
    
    def update_doctor_settings(self, doctor_id: str, settings_data: dict) -> dict:
        """Update doctor's appointment settings."""
        session = self._get_session()
        try:
            settings = session.query(DoctorSettings).filter(DoctorSettings.doctor_id == doctor_id).first()
            
            if settings:
                for key, value in settings_data.items():
                    if hasattr(settings, key):
                        setattr(settings, key, value)
            else:
                settings = DoctorSettings(doctor_id=doctor_id, **settings_data)
                session.add(settings)
            
            session.commit()
            return settings_data
        finally:
            session.close()
    
    def update_patient_reputation(self, patient_id: str, action: str):
        """Update patient reputation based on action."""
        session = self._get_session()
        try:
            reputation = session.query(PatientReputation).filter(PatientReputation.patient_id == patient_id).first()
            
            if reputation:
                if action == "no_show":
                    reputation.no_show_count = (reputation.no_show_count or 0) + 1
                    reputation.reputation_score = max(0, (reputation.reputation_score or 50) - 10)
                elif action == "completed":
                    reputation.completed_appointments = (reputation.completed_appointments or 0) + 1
                    reputation.reputation_score = min(100, (reputation.reputation_score or 50) + 2)
                reputation.total_appointments = (reputation.total_appointments or 0) + 1
            else:
                reputation = PatientReputation(
                    patient_id=patient_id,
                    total_appointments=1,
                    completed_appointments=1 if action == "completed" else 0,
                    no_show_count=1 if action == "no_show" else 0,
                    reputation_score=40 if action == "no_show" else 52
                )
                session.add(reputation)
            
            session.commit()
        finally:
            session.close()
    
    def search_doctors(self, filters: dict) -> List[dict]:
        """Search for doctors with filters."""
        session = self._get_session()
        try:
            query = session.query(Doctor)
            
            if filters.get("specialization"):
                query = query.filter(Doctor.specialization == filters["specialization"])
            
            doctors = query.limit(50).all()
            results = []
            
            for d in doctors:
                if filters.get("query"):
                    search_text = filters["query"].lower()
                    name = (d.name or "").lower()
                    spec = (d.specialization or "").lower()
                    if search_text not in name and search_text not in spec:
                        continue
                results.append(self._doctor_to_dict(d))
            
            return results
        finally:
            session.close()
    
    def get_doctor_by_id(self, doctor_id: str) -> Optional[dict]:
        """Synchronous version for appointment operations."""
        session = self._get_session()
        try:
            doctor = session.query(Doctor).filter(Doctor.id == doctor_id).first()
            if doctor:
                return self._doctor_to_dict(doctor)
            return None
        finally:
            session.close()
    
    def _appointment_to_dict(self, appt: Appointment) -> dict:
        """Convert Appointment model to dictionary."""
        return {
            "id": appt.id,
            "patient_id": appt.patient_id,
            "doctor_id": appt.doctor_id,
            "status": appt.status,
            "mode": appt.mode,
            "scheduled_time": appt.scheduled_time.isoformat() if appt.scheduled_time else None,
            "patient_timezone": appt.patient_timezone,
            "doctor_timezone": appt.doctor_timezone,
            "estimated_duration_mins": appt.estimated_duration_mins,
            "queue_number": appt.queue_number,
            "queue_date": appt.queue_date,
            "meet_link": appt.meet_link,
            "hospital_address": appt.hospital_address,
            "patient_joined_at": appt.patient_joined_at.isoformat() if appt.patient_joined_at else None,
            "consultation_started_at": appt.consultation_started_at.isoformat() if appt.consultation_started_at else None,
            "consultation_ended_at": appt.consultation_ended_at.isoformat() if appt.consultation_ended_at else None,
            "patient_profile_id": appt.patient_profile_id,
            "ai_conversation_id": appt.ai_conversation_id,
            "patient_name": appt.patient_name,
            "patient_age": appt.patient_age,
            "patient_gender": appt.patient_gender,
            "chief_complaint": appt.chief_complaint,
            "created_at": appt.created_at.isoformat() if appt.created_at else None,
            "updated_at": appt.updated_at.isoformat() if appt.updated_at else None,
            "cancelled_reason": appt.cancelled_reason,
            "notes": appt.notes
        }
    
    def _settings_to_dict(self, settings: DoctorSettings) -> dict:
        """Convert DoctorSettings to dictionary."""
        return {
            "doctor_id": settings.doctor_id,
            "accepts_online": settings.accepts_online,
            "accepts_offline": settings.accepts_offline,
            "accepting_appointments_today": settings.accepting_appointments_today,
            "hospital_name": settings.hospital_name,
            "hospital_address": settings.hospital_address,
            "hospital_coordinates": settings.hospital_coordinates,
            "consultation_duration_mins": settings.consultation_duration_mins,
            "threshold_wait_mins": settings.threshold_wait_mins,
            "max_patients_per_day": settings.max_patients_per_day,
            "working_hours_start": settings.working_hours_start,
            "working_hours_end": settings.working_hours_end,
            "timezone": settings.timezone,
            "break_times": settings.break_times or [],
            "online_consultation_fee": settings.online_consultation_fee,
            "offline_consultation_fee": settings.offline_consultation_fee,
            "custom_meet_link": settings.custom_meet_link
        }
    
    # ===========================================
    # ADDITIONAL PATIENT DATA OPERATIONS
    # (Used by patients.py, chat.py, analysis.py)
    # ===========================================
    
    async def get_patients(self, limit: int = 20, offset: int = 0) -> List[dict]:
        """Get list of patients with pagination."""
        session = self._get_session()
        try:
            patients = session.query(Patient).offset(offset).limit(limit).all()
            return [self._patient_to_dict(p) for p in patients]
        finally:
            session.close()
    
    async def get_patient(self, patient_id: str) -> Optional[dict]:
        """Get patient details by ID (for demo/timeline features)."""
        # First check demo patients
        demo = await self.get_demo_patient(patient_id)
        if demo:
            return demo
        
        # Then check regular patients
        return await self.get_patient_by_id(patient_id)
    
    async def get_patient_history(self, patient_id: str) -> Optional[dict]:
        """Get complete patient history for AI analysis.
        
        Returns demo patient data structure with profile, scans, labs, treatments.
        """
        patient = await self.get_patient(patient_id)
        if not patient:
            return None
        
        # If it's a demo patient (has 'profile' key), return as-is
        if 'profile' in patient:
            return patient
        
        # For regular patients, construct history from available data
        return {
            "id": patient.get("id"),
            "profile": {
                "name": patient.get("name"),
                "age": None,  # Would need to calculate from date_of_birth
                "gender": patient.get("gender"),
                "diagnosis": "",
                "stage": "",
                "diagnosed_date": "",
                "genetic_markers": []
            },
            "scans": [],
            "labs": [],
            "treatments": []
        }
    
    async def get_scan(self, scan_id: str) -> Optional[dict]:
        """Get scan by ID (placeholder for future implementation)."""
        # Scans would need their own table if needed
        # For now, return None as a placeholder
        return None
# ===========================================
# HARDCODED DEMO DATA (fallback)
# ===========================================

DEMO_PATIENT_SARAH = {
    "id": "patient_sarah_001",
    "profile": {
        "name": "Sarah Thompson",
        "age": 62,
        "gender": "Female",
        "diagnosis": "Invasive Ductal Carcinoma (Breast Cancer)",
        "stage": "Stage IIB at diagnosis, currently Stage IV with bone metastases",
        "diagnosed_date": "2018-03-15",
        "genetic_markers": ["BRCA2 positive", "ER+", "PR+", "HER2-"],
    },
    "scans": [],
    "labs": [],
    "treatments": []
}


# Singleton instance
database_service = DatabaseService()


def get_database_service() -> DatabaseService:
    """Get the database service singleton."""
    return database_service


# Alias for backward compatibility
def get_firebase_service() -> DatabaseService:
    """Backward compatible alias - returns database service."""
    return database_service
