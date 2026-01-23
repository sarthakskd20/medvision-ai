"""
Consultation API Router
Endpoints for managing active consultation sessions between doctors and patients.
"""

from fastapi import APIRouter, HTTPException, status, UploadFile, File
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
import json

from ..models.consultation import (
    ConsultationSession,
    ConsultationStatus,
    SecureMessage,
    MessageContentType,
    SenderType,
    MessageCreate,
    DoctorNotes,
    DoctorNotesUpdate,
    VitalSigns,
    Prescription,
    PrescriptionCreate,
    Medication,
    AdvisedTest,
    DoctorUnavailability,
    DoctorUnavailabilityCreate,
    QueuePosition,
    FinishConsultationRequest,
    AuditLogEntry
)
from ..services.encryption_service import (
    get_encryption_service,
    validate_attachment,
    sanitize_filename
)
from ..services.hybrid_service import get_database_service

router = APIRouter(prefix="/api/consultation", tags=["consultation"])

# Get services
db = get_database_service()
encryption = get_encryption_service()


# =============================================================================
# CONSULTATION SESSION ENDPOINTS
# =============================================================================

@router.post("/start/{appointment_id}")
async def start_consultation(appointment_id: str):
    """
    Start a consultation session for an appointment.
    Called when doctor is ready to see the patient.
    """
    try:
        # Get appointment
        appointment = db.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Check if consultation already exists
        existing = db.get_consultation_by_appointment(appointment_id)
        if existing:
            return existing
        
        # Create consultation session
        consultation_id = encryption.generate_consultation_id()
        
        consultation = ConsultationSession(
            id=consultation_id,
            appointment_id=appointment_id,
            doctor_id=appointment.get('doctor_id'),
            patient_id=appointment.get('patient_id'),
            status=ConsultationStatus.WAITING,
            is_online=appointment.get('mode') == 'online',
            meet_link=appointment.get('meet_link'),
            current_token=appointment.get('queue_number'),
            created_at=datetime.utcnow()
        )
        
        # Save to database
        result = db.create_consultation(consultation.model_dump())
        
        # Update appointment status
        db.update_appointment(appointment_id, {
            'status': 'in_progress',
            'consultation_started_at': datetime.utcnow().isoformat()
        })
        
        # Create audit log
        _log_action("start_consultation", "doctor", appointment.get('doctor_id'), 
                   "consultation", consultation_id, appointment_id, consultation_id)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error starting consultation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{consultation_id}/status")
async def update_consultation_status(
    consultation_id: str,
    status: ConsultationStatus
):
    """Update the status of a consultation session."""
    try:
        consultation = db.get_consultation_by_id(consultation_id)
        if not consultation:
            raise HTTPException(status_code=404, detail="Consultation not found")
        
        updates = {
            'status': status.value,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Set timestamps based on status
        if status == ConsultationStatus.PATIENT_ARRIVED:
            updates['patient_joined_at'] = datetime.utcnow().isoformat()
        elif status == ConsultationStatus.IN_PROGRESS:
            updates['started_at'] = datetime.utcnow().isoformat()
        elif status == ConsultationStatus.COMPLETED:
            updates['ended_at'] = datetime.utcnow().isoformat()
        
        result = db.update_consultation(consultation_id, updates)
        
        # Broadcast status change via WebSocket (TODO: implement WebSocket)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating consultation status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{consultation_id}")
async def get_consultation(consultation_id: str):
    """Get consultation details including patient profile."""
    try:
        consultation = db.get_consultation_by_id(consultation_id)
        if not consultation:
            raise HTTPException(status_code=404, detail="Consultation not found")
        
        # Get related data
        appointment = db.get_appointment_by_id(consultation.get('appointment_id'))
        patient_profile = None
        if appointment:
            patient_profile = db.get_patient_profile_by_appointment(appointment.get('id'))
        
        # Get doctor notes
        notes = db.get_doctor_notes_by_consultation(consultation_id)
        
        return {
            'consultation': consultation,
            'appointment': appointment,
            'patient_profile': patient_profile,
            'doctor_notes': notes
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting consultation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{consultation_id}/finish")
async def finish_consultation(
    consultation_id: str,
    request: FinishConsultationRequest
):
    """Complete a consultation and move to next patient."""
    try:
        consultation = db.get_consultation_by_id(consultation_id)
        if not consultation:
            raise HTTPException(status_code=404, detail="Consultation not found")
        
        # Update consultation
        db.update_consultation(consultation_id, {
            'status': ConsultationStatus.COMPLETED.value,
            'ended_at': datetime.utcnow().isoformat()
        })
        
        # Update doctor notes with final diagnosis
        if request.final_diagnosis:
            notes = db.get_doctor_notes_by_consultation(consultation_id)
            if notes:
                db.update_doctor_notes(notes.get('id'), {
                    'provisional_diagnosis': request.final_diagnosis
                })
        
        # Update appointment
        appointment_id = consultation.get('appointment_id')
        db.update_appointment(appointment_id, {
            'status': 'completed',
            'consultation_ended_at': datetime.utcnow().isoformat(),
            'notes': request.treatment_summary
        })
        
        # If follow-up required, create reminder
        if request.follow_up_required and request.follow_up_date:
            # TODO: Create follow-up reminder in patient's records
            pass
        
        # Log completion
        _log_action("finish_consultation", "doctor", consultation.get('doctor_id'),
                   "consultation", consultation_id, appointment_id, consultation_id)
        
        return {
            'message': 'Consultation completed successfully',
            'completed_at': datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error finishing consultation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# MESSAGING ENDPOINTS
# =============================================================================

@router.get("/{consultation_id}/messages")
async def get_messages(consultation_id: str):
    """Get all messages for a consultation."""
    try:
        messages = db.get_messages_by_consultation(consultation_id)
        
        # Decrypt messages
        decrypted_messages = []
        for msg in messages:
            try:
                decrypted_content = encryption.decrypt_message(
                    msg.get('encrypted_content'),
                    msg.get('iv'),
                    consultation_id
                )
                decrypted_messages.append({
                    **msg,
                    'content': decrypted_content,
                    'encrypted_content': None,  # Don't send encrypted data
                    'iv': None
                })
            except Exception as e:
                print(f"Error decrypting message: {e}")
                decrypted_messages.append({
                    **msg,
                    'content': '[Decryption failed]'
                })
        
        return {'messages': decrypted_messages}
        
    except Exception as e:
        print(f"Error getting messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{consultation_id}/messages")
async def send_message(
    consultation_id: str,
    message: MessageCreate,
    sender_type: str = "doctor",  # Should come from auth
    sender_id: str = ""  # Should come from auth
):
    """Send an encrypted message."""
    try:
        consultation = db.get_consultation_by_id(consultation_id)
        if not consultation:
            raise HTTPException(status_code=404, detail="Consultation not found")
        
        # Encrypt the message
        encrypted_content, iv = encryption.encrypt_message(
            message.content,
            consultation_id
        )
        
        # Create message record
        message_id = encryption.generate_message_id()
        
        secure_message = SecureMessage(
            id=message_id,
            consultation_id=consultation_id,
            appointment_id=consultation.get('appointment_id'),
            sender_type=SenderType(sender_type),
            sender_id=sender_id or (consultation.get('doctor_id') if sender_type == 'doctor' else consultation.get('patient_id')),
            encrypted_content=encrypted_content,
            iv=iv,
            content_type=message.content_type,
            created_at=datetime.utcnow()
        )
        
        result = db.create_message(secure_message.model_dump())
        
        # Return decrypted for sender confirmation
        return {
            'id': message_id,
            'content': message.content,
            'content_type': message.content_type,
            'sender_type': sender_type,
            'created_at': secure_message.created_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{consultation_id}/messages/attachment")
async def upload_attachment(
    consultation_id: str,
    file: UploadFile = File(...),
    sender_type: str = "doctor",
    sender_id: str = ""
):
    """Upload an attachment (image or PDF)."""
    try:
        # Read file content
        content = await file.read()
        
        # Validate file
        is_valid, error = validate_attachment(
            content,
            file.filename,
            file.content_type
        )
        
        if not is_valid:
            raise HTTPException(status_code=400, detail=error)
        
        # Generate secure filename
        safe_filename = sanitize_filename(file.filename)
        file_hash = encryption.hash_file(content)
        storage_filename = f"{consultation_id}/{file_hash}_{safe_filename}"
        
        # TODO: Upload to secure storage (Firebase Storage, S3, etc.)
        # For now, we'll store locally
        import os
        upload_dir = f"uploads/{consultation_id}"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = f"{upload_dir}/{file_hash}_{safe_filename}"
        with open(file_path, 'wb') as f:
            f.write(content)
        
        # Determine content type
        content_type = MessageContentType.IMAGE if file.content_type.startswith('image') else MessageContentType.PDF
        
        # Create message with attachment
        message_id = encryption.generate_message_id()
        encrypted_content, iv = encryption.encrypt_message(
            f"[Attachment: {safe_filename}]",
            consultation_id
        )
        
        consultation = db.get_consultation_by_id(consultation_id)
        
        attachment_metadata = {
            'filename': safe_filename,
            'size_bytes': len(content),
            'mime_type': file.content_type,
            'checksum': file_hash
        }
        
        secure_message = SecureMessage(
            id=message_id,
            consultation_id=consultation_id,
            appointment_id=consultation.get('appointment_id'),
            sender_type=SenderType(sender_type),
            sender_id=sender_id or consultation.get('doctor_id'),
            encrypted_content=encrypted_content,
            iv=iv,
            content_type=content_type,
            attachment_url=file_path,
            attachment_metadata=attachment_metadata,
            created_at=datetime.utcnow()
        )
        
        db.create_message(secure_message.model_dump())
        
        return {
            'id': message_id,
            'filename': safe_filename,
            'content_type': content_type.value,
            'size_bytes': len(content),
            'attachment_url': file_path
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading attachment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# DOCTOR NOTES ENDPOINTS
# =============================================================================

@router.get("/{consultation_id}/notes")
async def get_doctor_notes(consultation_id: str):
    """Get doctor's notes for a consultation."""
    try:
        notes = db.get_doctor_notes_by_consultation(consultation_id)
        return notes or {}
    except Exception as e:
        print(f"Error getting notes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{consultation_id}/notes")
async def update_doctor_notes(
    consultation_id: str,
    notes: DoctorNotesUpdate
):
    """Update or create doctor's notes."""
    try:
        consultation = db.get_consultation_by_id(consultation_id)
        if not consultation:
            raise HTTPException(status_code=404, detail="Consultation not found")
        
        existing_notes = db.get_doctor_notes_by_consultation(consultation_id)
        
        if existing_notes:
            # Update existing
            updates = {k: v for k, v in notes.model_dump().items() if v is not None}
            updates['updated_at'] = datetime.utcnow().isoformat()
            result = db.update_doctor_notes(existing_notes.get('id'), updates)
        else:
            # Create new
            notes_data = DoctorNotes(
                id=f"notes_{uuid.uuid4().hex[:16]}",
                appointment_id=consultation.get('appointment_id'),
                consultation_id=consultation_id,
                doctor_id=consultation.get('doctor_id'),
                patient_id=consultation.get('patient_id'),
                **{k: v for k, v in notes.model_dump().items() if v is not None}
            )
            result = db.create_doctor_notes(notes_data.model_dump())
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating notes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# PRESCRIPTION ENDPOINTS
# =============================================================================

@router.post("/{consultation_id}/prescription")
async def create_prescription(
    consultation_id: str,
    prescription: PrescriptionCreate
):
    """Create a prescription for the consultation."""
    try:
        consultation = db.get_consultation_by_id(consultation_id)
        if not consultation:
            raise HTTPException(status_code=404, detail="Consultation not found")
        
        # Generate prescription ID
        prescription_id = f"rx_{uuid.uuid4().hex[:16]}"
        now = datetime.utcnow()
        
        # Create content hash for signature
        content_hash = json.dumps({
            'medications': [m.model_dump() for m in prescription.medications],
            'tests': [t.model_dump() for t in prescription.advised_tests]
        }, sort_keys=True)
        
        # Generate digital signature
        signature = encryption.generate_signature(
            content_hash,
            consultation.get('doctor_id'),
            now
        )
        
        # Create prescription record
        rx = Prescription(
            id=prescription_id,
            appointment_id=consultation.get('appointment_id'),
            consultation_id=consultation_id,
            patient_id=consultation.get('patient_id'),
            doctor_id=consultation.get('doctor_id'),
            medications=prescription.medications,
            advised_tests=prescription.advised_tests,
            follow_up_date=prescription.follow_up_date,
            follow_up_notes=prescription.follow_up_notes,
            diet_instructions=prescription.diet_instructions,
            lifestyle_advice=prescription.lifestyle_advice,
            special_instructions=prescription.special_instructions,
            warning_signs=prescription.warning_signs,
            doctor_signature_hash=signature,
            created_at=now
        )
        
        result = db.create_prescription(rx.model_dump())
        
        # Log prescription creation
        _log_action("create_prescription", "doctor", consultation.get('doctor_id'),
                   "prescription", prescription_id, consultation.get('appointment_id'), consultation_id)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating prescription: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/prescriptions/patient/{patient_id}")
async def get_patient_prescriptions(patient_id: str):
    """Get all prescriptions for a patient."""
    try:
        prescriptions = db.get_prescriptions_by_patient(patient_id)
        return {'prescriptions': prescriptions}
    except Exception as e:
        print(f"Error getting prescriptions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# QUEUE MANAGEMENT ENDPOINTS
# =============================================================================

@router.get("/queue/doctor/{doctor_id}")
async def get_doctor_queue(doctor_id: str):
    """Get current queue for a doctor."""
    try:
        # Get today's appointments
        today = datetime.now().strftime('%Y-%m-%d')
        appointments = db.get_appointments_by_doctor_date(doctor_id, today)
        
        # Filter pending/in-progress
        queue = [
            a for a in appointments
            if a.get('status') in ['pending', 'confirmed', 'in_progress']
        ]
        
        # Sort by queue number
        queue.sort(key=lambda x: x.get('queue_number', 999))
        
        # Find current (in_progress)
        current = next((a for a in queue if a.get('status') == 'in_progress'), None)
        
        return {
            'queue': queue,
            'current': current,
            'current_token': current.get('queue_number') if current else 0,
            'total_waiting': len([a for a in queue if a.get('status') in ['pending', 'confirmed']])
        }
        
    except Exception as e:
        print(f"Error getting queue: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/queue/position/{appointment_id}")
async def get_queue_position(appointment_id: str):
    """Get patient's position in queue."""
    try:
        appointment = db.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        doctor_id = appointment.get('doctor_id')
        today = datetime.now().strftime('%Y-%m-%d')
        appointments = db.get_appointments_by_doctor_date(doctor_id, today)
        
        # Find current serving
        current = next((a for a in appointments if a.get('status') == 'in_progress'), None)
        current_token = current.get('queue_number', 0) if current else 0
        
        patient_token = appointment.get('queue_number', 0)
        
        # Calculate position
        ahead = len([
            a for a in appointments
            if a.get('queue_number', 999) < patient_token
            and a.get('status') in ['pending', 'confirmed']
        ])
        
        # Estimate wait time (15 mins per patient average)
        estimated_wait = ahead * 15
        
        # Check doctor availability
        unavailability = db.get_current_unavailability(doctor_id)
        doctor_status = "unavailable" if unavailability else "available"
        
        return QueuePosition(
            appointment_id=appointment_id,
            patient_id=appointment.get('patient_id'),
            queue_number=patient_token,
            current_serving=current_token,
            estimated_wait_minutes=estimated_wait,
            doctor_status=doctor_status,
            doctor_unavailable_until=unavailability.get('end_time') if unavailability else None,
            unavailability_reason=unavailability.get('reason') if unavailability else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting queue position: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# DOCTOR UNAVAILABILITY
# =============================================================================

@router.post("/unavailability")
async def set_doctor_unavailable(
    request: DoctorUnavailabilityCreate,
    doctor_id: str = ""  # Should come from auth
):
    """Mark doctor as unavailable for a period."""
    try:
        unavailability_id = f"unavail_{uuid.uuid4().hex[:16]}"
        
        # Find affected appointments
        today = datetime.now().strftime('%Y-%m-%d')
        appointments = db.get_appointments_by_doctor_date(doctor_id, today)
        
        affected = [
            a.get('id') for a in appointments
            if a.get('status') in ['pending', 'confirmed']
        ]
        
        unavailability = DoctorUnavailability(
            id=unavailability_id,
            doctor_id=doctor_id,
            start_time=request.start_time,
            end_time=request.end_time,
            reason=request.reason,
            custom_message=request.custom_message,
            notify_patients=request.notify_patients,
            affected_appointment_ids=affected
        )
        
        result = db.create_unavailability(unavailability.model_dump())
        
        # TODO: Send notifications to affected patients via WebSocket
        
        return result
        
    except Exception as e:
        print(f"Error setting unavailability: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# HELPERS
# =============================================================================

def _log_action(
    action: str,
    actor_type: str,
    actor_id: str,
    resource_type: str,
    resource_id: str,
    appointment_id: str = None,
    consultation_id: str = None
):
    """Create an audit log entry."""
    try:
        entry = AuditLogEntry(
            id=f"audit_{uuid.uuid4().hex[:16]}",
            actor_type=actor_type,
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            appointment_id=appointment_id,
            consultation_id=consultation_id
        )
        db.create_audit_log(entry.model_dump())
    except Exception as e:
        print(f"Warning: Failed to create audit log: {e}")
