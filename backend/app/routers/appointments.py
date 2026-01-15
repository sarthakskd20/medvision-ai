"""
Appointment API Router
Endpoints for managing patient-doctor appointments.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from ..models.appointment import (
    Appointment,
    AppointmentStatus,
    AppointmentMode,
    PatientProfile,
    DoctorSettings,
    PatientReputation,
    CreateAppointmentRequest,
    UpdateAppointmentStatusRequest,
    PatientProfileCreateRequest,
    DoctorSearchFilters
)
from ..services.firebase_service import get_firebase_service


router = APIRouter(prefix="/api/appointments", tags=["appointments"])


# ============================================================================
# PATIENT ENDPOINTS
# ============================================================================

@router.post("/", response_model=dict)
async def create_appointment(request: CreateAppointmentRequest):
    """Create a new appointment booking."""
    try:
        firebase = get_firebase_service()
        
        # Check if doctor exists and accepts this mode
        doctor = firebase.get_doctor_by_id(request.doctor_id)
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        # Generate appointment ID
        appointment_id = str(uuid.uuid4())
        
        # Calculate queue number for the day
        queue_date = request.scheduled_time.strftime("%Y-%m-%d")
        existing_appointments = firebase.get_appointments_by_doctor_date(
            request.doctor_id, queue_date
        )
        queue_number = len(existing_appointments) + 1
        
        # Create appointment object
        appointment = Appointment(
            id=appointment_id,
            patient_id="current_patient_id",  # TODO: Get from auth token
            doctor_id=request.doctor_id,
            status=AppointmentStatus.PENDING,
            mode=request.mode,
            scheduled_time=request.scheduled_time,
            patient_timezone=request.patient_timezone,
            doctor_timezone=doctor.get("timezone", "Asia/Kolkata"),
            queue_number=queue_number,
            queue_date=queue_date,
            hospital_address=doctor.get("hospital_address") if request.mode == AppointmentMode.OFFLINE else None
        )
        
        # Save to Firestore
        firebase.create_appointment(appointment.dict())
        
        return {
            "success": True,
            "appointment_id": appointment_id,
            "queue_number": queue_number,
            "message": "Appointment created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patient/{patient_id}", response_model=List[dict])
async def get_patient_appointments(
    patient_id: str,
    status: Optional[AppointmentStatus] = None
):
    """Get all appointments for a patient."""
    try:
        firebase = get_firebase_service()
        appointments = firebase.get_appointments_by_patient(patient_id, status)
        return appointments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{appointment_id}", response_model=dict)
async def get_appointment(appointment_id: str):
    """Get appointment details by ID."""
    try:
        firebase = get_firebase_service()
        appointment = firebase.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return appointment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{appointment_id}/cancel")
async def cancel_appointment(appointment_id: str, reason: Optional[str] = None):
    """Cancel an appointment."""
    try:
        firebase = get_firebase_service()
        appointment = firebase.get_appointment_by_id(appointment_id)
        
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        if appointment.get("status") in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]:
            raise HTTPException(status_code=400, detail="Cannot cancel this appointment")
        
        firebase.update_appointment(appointment_id, {
            "status": AppointmentStatus.CANCELLED,
            "cancelled_reason": reason,
            "updated_at": datetime.utcnow()
        })
        
        return {"success": True, "message": "Appointment cancelled"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# PATIENT PROFILE ENDPOINTS
# ============================================================================

@router.post("/{appointment_id}/profile")
async def submit_patient_profile(
    appointment_id: str,
    profile_data: PatientProfileCreateRequest
):
    """Submit patient profile for an appointment."""
    try:
        firebase = get_firebase_service()
        
        # Verify appointment exists
        appointment = firebase.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        profile_id = str(uuid.uuid4())
        
        # Calculate token count estimate based on data
        token_estimate = estimate_token_count(profile_data)
        complexity_tier = "light" if token_estimate < 10000 else "medium" if token_estimate < 100000 else "heavy"
        
        profile = PatientProfile(
            id=profile_id,
            patient_id=appointment["patient_id"],
            appointment_id=appointment_id,
            basic_info=profile_data.basic_info,
            chief_complaint=profile_data.chief_complaint,
            medical_history=profile_data.medical_history,
            family_history=profile_data.family_history,
            lifestyle=profile_data.lifestyle,
            token_count=token_estimate,
            complexity_tier=complexity_tier
        )
        
        # Save profile
        firebase.create_patient_profile(profile.dict())
        
        # Update appointment with profile reference
        firebase.update_appointment(appointment_id, {
            "patient_profile_id": profile_id,
            "status": AppointmentStatus.CONFIRMED,
            "updated_at": datetime.utcnow()
        })
        
        return {
            "success": True,
            "profile_id": profile_id,
            "complexity_tier": complexity_tier
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def estimate_token_count(profile: PatientProfileCreateRequest) -> int:
    """Estimate token count based on profile data."""
    base_tokens = 500  # Basic profile info
    
    # Chief complaint
    base_tokens += len(profile.chief_complaint.description.split()) * 2
    
    # Medical history
    base_tokens += len(profile.medical_history) * 100
    
    # Documents (assume ~5000 tokens per PDF page, ~3 pages average)
    # Note: This is a placeholder - actual count would require PDF parsing
    
    return base_tokens


# ============================================================================
# DOCTOR ENDPOINTS
# ============================================================================

@router.get("/doctor/{doctor_id}/today")
async def get_doctor_appointments_today(doctor_id: str):
    """Get all appointments for a doctor for today."""
    try:
        firebase = get_firebase_service()
        today = datetime.now().strftime("%Y-%m-%d")
        appointments = firebase.get_appointments_by_doctor_date(doctor_id, today)
        
        # Sort by queue number
        appointments.sort(key=lambda x: x.get("queue_number", 0))
        
        # Calculate stats
        total = len(appointments)
        completed = len([a for a in appointments if a.get("status") == AppointmentStatus.COMPLETED])
        in_progress = len([a for a in appointments if a.get("status") == AppointmentStatus.IN_PROGRESS])
        remaining = total - completed - in_progress
        no_shows = len([a for a in appointments if a.get("status") == AppointmentStatus.NO_SHOW])
        
        return {
            "appointments": appointments,
            "stats": {
                "total": total,
                "completed": completed,
                "in_progress": in_progress,
                "remaining": remaining,
                "no_shows": no_shows
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    request: UpdateAppointmentStatusRequest
):
    """Update appointment status (for doctors)."""
    try:
        firebase = get_firebase_service()
        
        appointment = firebase.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        update_data = {
            "status": request.status,
            "updated_at": datetime.utcnow()
        }
        
        # Handle specific status transitions
        if request.status == AppointmentStatus.IN_PROGRESS:
            update_data["consultation_started_at"] = datetime.utcnow()
        elif request.status == AppointmentStatus.COMPLETED:
            update_data["consultation_ended_at"] = datetime.utcnow()
        elif request.status == AppointmentStatus.NO_SHOW:
            # Update patient reputation
            patient_id = appointment.get("patient_id")
            if patient_id:
                firebase.update_patient_reputation(patient_id, "no_show")
        
        firebase.update_appointment(appointment_id, update_data)
        
        return {"success": True, "status": request.status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{appointment_id}/patient-joined")
async def mark_patient_joined(appointment_id: str):
    """Mark that patient has joined the appointment."""
    try:
        firebase = get_firebase_service()
        
        appointment = firebase.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        firebase.update_appointment(appointment_id, {
            "patient_joined_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        return {"success": True, "message": "Patient marked as joined"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{appointment_id}/reassign")
async def reassign_patient(appointment_id: str):
    """Reassign patient to end of queue (for late arrival)."""
    try:
        firebase = get_firebase_service()
        
        appointment = firebase.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Get current queue for the day
        queue_date = appointment.get("queue_date")
        doctor_id = appointment.get("doctor_id")
        
        appointments_today = firebase.get_appointments_by_doctor_date(doctor_id, queue_date)
        max_queue = max([a.get("queue_number", 0) for a in appointments_today])
        
        # Reassign to end
        firebase.update_appointment(appointment_id, {
            "queue_number": max_queue + 1,
            "notes": f"Reassigned from queue #{appointment.get('queue_number')} due to late arrival",
            "updated_at": datetime.utcnow()
        })
        
        return {"success": True, "new_queue_number": max_queue + 1}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# DOCTOR SETTINGS ENDPOINTS
# ============================================================================

@router.get("/doctor/{doctor_id}/settings")
async def get_doctor_settings(doctor_id: str):
    """Get doctor's appointment settings."""
    try:
        firebase = get_firebase_service()
        settings = firebase.get_doctor_settings(doctor_id)
        
        if not settings:
            # Return default settings
            return DoctorSettings(doctor_id=doctor_id).dict()
        
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/doctor/{doctor_id}/settings")
async def update_doctor_settings(doctor_id: str, settings: DoctorSettings):
    """Update doctor's appointment settings."""
    try:
        firebase = get_firebase_service()
        
        settings.doctor_id = doctor_id
        settings.updated_at = datetime.utcnow()
        
        firebase.update_doctor_settings(doctor_id, settings.dict())
        
        return {"success": True, "message": "Settings updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/doctor/{doctor_id}/toggle-accepting")
async def toggle_accepting_appointments(doctor_id: str, accepting: bool):
    """Toggle whether doctor is accepting appointments today."""
    try:
        firebase = get_firebase_service()
        
        firebase.update_doctor_settings(doctor_id, {
            "accepting_appointments_today": accepting,
            "updated_at": datetime.utcnow()
        })
        
        return {"success": True, "accepting": accepting}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# DOCTOR SEARCH ENDPOINTS
# ============================================================================

@router.get("/doctors/search")
async def search_doctors(
    q: Optional[str] = None,
    specialization: Optional[str] = None,
    mode: Optional[str] = None,
    available_date: Optional[str] = None
):
    """Search for doctors with filters."""
    try:
        firebase = get_firebase_service()
        
        filters = DoctorSearchFilters(
            query=q,
            specialization=specialization,
            mode=AppointmentMode(mode) if mode else None,
            available_date=available_date
        )
        
        doctors = firebase.search_doctors(filters.dict())
        
        return {
            "doctors": doctors,
            "total": len(doctors)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/doctors/{doctor_id}/slots")
async def get_available_slots(doctor_id: str, date: str):
    """Get available appointment slots for a doctor on a specific date."""
    try:
        firebase = get_firebase_service()
        
        # Get doctor settings
        settings = firebase.get_doctor_settings(doctor_id)
        if not settings:
            settings = DoctorSettings(doctor_id=doctor_id).dict()
        
        # Get existing appointments for the date
        existing = firebase.get_appointments_by_doctor_date(doctor_id, date)
        booked_times = set([a.get("scheduled_time") for a in existing])
        
        # Generate available slots based on working hours
        slots = []
        start_hour, start_min = map(int, settings.get("working_hours_start", "09:00").split(":"))
        end_hour, end_min = map(int, settings.get("working_hours_end", "18:00").split(":"))
        duration = settings.get("consultation_duration_mins", 15)
        
        from datetime import datetime as dt
        current = dt.strptime(f"{date} {start_hour:02d}:{start_min:02d}", "%Y-%m-%d %H:%M")
        end = dt.strptime(f"{date} {end_hour:02d}:{end_min:02d}", "%Y-%m-%d %H:%M")
        
        while current < end:
            time_str = current.strftime("%H:%M")
            if current.isoformat() not in booked_times:
                slots.append({
                    "time": time_str,
                    "datetime": current.isoformat(),
                    "display": current.strftime("%I:%M %p")
                })
            current += timedelta(minutes=duration)
        
        return {
            "date": date,
            "slots": slots,
            "consultation_duration": duration
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
