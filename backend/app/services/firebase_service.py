"""
Firebase Service
Handles Firestore database operations for patient data.
"""
from typing import Optional
from app.config import settings

# For hackathon demo, we use in-memory data
# In production, this would use firebase_admin

DEMO_PATIENTS = {
    "patient_sarah_001": {
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
}


class FirebaseService:
    """Service for Firestore database operations."""
    
    def __init__(self):
        # In production, initialize Firebase Admin SDK
        # For hackathon demo, we use in-memory data
        self.initialized = True
    
    async def get_patients(self, limit: int = 20, offset: int = 0) -> list[dict]:
        """Get list of patients."""
        patients = list(DEMO_PATIENTS.values())
        return patients[offset:offset + limit]
    
    async def get_patient(self, patient_id: str) -> Optional[dict]:
        """Get patient by ID."""
        return DEMO_PATIENTS.get(patient_id)
    
    async def get_patient_history(self, patient_id: str) -> Optional[dict]:
        """Get complete patient history including all scans, labs, and treatments."""
        patient = DEMO_PATIENTS.get(patient_id)
        if not patient:
            return None
        
        # Return full patient data including history
        return patient
    
    async def get_scan(self, scan_id: str) -> Optional[dict]:
        """Get a specific scan by ID."""
        for patient in DEMO_PATIENTS.values():
            for scan in patient.get("scans", []):
                if scan.get("id") == scan_id:
                    return scan
        return None
    
    async def create_patient(self, patient_data: dict) -> dict:
        """Create a new patient."""
        patient_id = f"patient_{len(DEMO_PATIENTS) + 1}"
        patient_data["id"] = patient_id
        DEMO_PATIENTS[patient_id] = patient_data
        return patient_data
    
    async def update_patient(self, patient_id: str, updates: dict) -> Optional[dict]:
        """Update patient data."""
        if patient_id not in DEMO_PATIENTS:
            return None
        
        DEMO_PATIENTS[patient_id].update(updates)
        return DEMO_PATIENTS[patient_id]


def load_demo_data():
    """Load demo patient data from JSON file if available."""
    import json
    import os
    
    demo_file = os.path.join(
        os.path.dirname(__file__), 
        "..", "..", "..", "demo-data", "patients", "sarah_thompson.json"
    )
    
    if os.path.exists(demo_file):
        with open(demo_file, "r") as f:
            data = json.load(f)
            DEMO_PATIENTS[data["id"]] = data
            print(f"Loaded demo patient: {data['profile']['name']}")


# Load demo data on import
try:
    load_demo_data()
except Exception as e:
    print(f"Could not load demo data: {e}")
