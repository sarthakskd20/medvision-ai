"""
Demo Data Generator
Creates Sarah Thompson's 8-year cancer journey for demo purposes.
"""
import json
import random
from datetime import datetime, timedelta
import os


def generate_sarah_thompson():
    """Generate 8-year cancer patient journey for demo."""
    
    base_date = datetime(2018, 3, 15)
    
    patient = {
        "id": "patient_sarah_001",
        "profile": {
            "name": "Sarah Thompson",
            "age": 62,
            "gender": "Female",
            "diagnosis": "Invasive Ductal Carcinoma (Breast Cancer)",
            "stage": "Stage IIB at diagnosis, currently Stage IV with bone metastases",
            "diagnosed_date": "2018-03-15",
            "genetic_markers": ["BRCA2 positive", "ER+", "PR+", "HER2-"],
            "allergies": ["Penicillin"],
            "comorbidities": ["Hypertension", "Type 2 Diabetes (controlled)"]
        },
        "scans": [],
        "labs": [],
        "treatments": [],
        "notes": []
    }
    
    # Generate scans (23 over 8 years)
    scan_configs = [
        ("Mammogram", "Breast", ["No significant changes", "Stable", "Post-surgical changes stable"]),
        ("CT", "Chest/Abdomen/Pelvis", ["No metastatic disease", "Stable disease", "Bone metastases stable"]),
        ("PET-CT", "Whole Body", ["Low metabolic activity", "Stable uptake", "New bone lesions"]),
        ("MRI", "Brain", ["No intracranial metastases", "Normal study", "Unchanged from prior"]),
        ("Bone Scan", "Skeleton", ["No skeletal metastases", "Stable bone lesions", "L3 vertebra uptake"])
    ]
    
    scan_id = 1
    for year in range(8):
        scans_this_year = random.randint(2, 4)
        for _ in range(scans_this_year):
            days_offset = year * 365 + random.randint(0, 365)
            scan_date = base_date + timedelta(days=days_offset)
            
            scan_type, body_part, findings_options = random.choice(scan_configs)
            
            # Progressive findings based on year
            if year < 4:
                finding = findings_options[0] if random.random() > 0.2 else findings_options[1]
                impression = "Stable disease. Continue current management."
                urgency = random.choice([1, 2])
            elif year < 6:
                finding = findings_options[1]
                impression = "Stable with minor changes. Follow-up recommended."
                urgency = random.choice([2, 3])
            else:
                finding = random.choice(findings_options[1:])
                impression = "Disease progression noted. Consider treatment modification."
                urgency = random.choice([3, 4, 5])
            
            patient["scans"].append({
                "id": f"scan_{scan_id:03d}",
                "date": scan_date.strftime("%Y-%m-%d"),
                "scan_type": scan_type,
                "body_part": body_part,
                "findings": finding,
                "impression": impression,
                "urgency": urgency
            })
            scan_id += 1
    
    # Generate labs (monthly for 8 years = 96 records)
    lab_tests = [
        ("CA 15-3", "U/mL", 0, 31, "tumor_marker"),
        ("CEA", "ng/mL", 0, 3.0, "tumor_marker"),
        ("Hemoglobin", "g/dL", 12.0, 15.5, "cbc"),
        ("WBC", "K/uL", 4.0, 11.0, "cbc"),
        ("Platelets", "K/uL", 150, 400, "cbc"),
        ("Creatinine", "mg/dL", 0.6, 1.2, "metabolic"),
        ("ALT", "U/L", 7, 56, "liver"),
        ("Alkaline Phosphatase", "U/L", 44, 147, "liver"),
        ("Calcium", "mg/dL", 8.5, 10.5, "metabolic"),
    ]
    
    lab_id = 1
    for month in range(96):
        lab_date = base_date + timedelta(days=month * 30 + random.randint(-3, 3))
        
        results = []
        for test_name, unit, low, high, category in lab_tests:
            # Simulate realistic trends
            if category == "tumor_marker" and month > 60:
                # Elevated tumor markers in later years
                multiplier = 1.5 + (month - 60) * 0.05
                value = random.uniform(low, high) * multiplier
            elif category == "cbc" and month > 48:
                # Slightly lower CBC during treatment
                value = random.uniform(low * 0.85, high * 0.95)
            else:
                value = random.uniform(low * 0.9, high * 1.1)
            
            flag = "NORMAL"
            if value < low:
                flag = "LOW"
            elif value > high:
                flag = "HIGH"
            elif value > high * 1.5:
                flag = "CRITICAL"
            
            results.append({
                "test": test_name,
                "value": round(value, 1),
                "unit": unit,
                "reference_range": f"{low}-{high}",
                "flag": flag
            })
        
        patient["labs"].append({
            "id": f"lab_{lab_id:03d}",
            "date": lab_date.strftime("%Y-%m-%d"),
            "results": results
        })
        lab_id += 1
    
    # Generate treatments
    patient["treatments"] = [
        {
            "id": "tx_001",
            "name": "Lumpectomy + Sentinel Lymph Node Biopsy",
            "type": "Surgery",
            "start_date": "2018-04-20",
            "end_date": "2018-04-20",
            "duration": "1 day",
            "response": "Complete resection achieved. 2/15 lymph nodes positive. Margins clear."
        },
        {
            "id": "tx_002",
            "name": "AC-T Chemotherapy (Doxorubicin/Cyclophosphamide followed by Paclitaxel)",
            "type": "Chemotherapy",
            "start_date": "2018-06-01",
            "end_date": "2018-11-30",
            "duration": "6 months",
            "response": "Completed all cycles. Partial response. Manageable side effects including fatigue and neuropathy."
        },
        {
            "id": "tx_003",
            "name": "Adjuvant Radiation Therapy",
            "type": "Radiation",
            "start_date": "2019-01-15",
            "end_date": "2019-02-28",
            "duration": "6 weeks",
            "response": "Completed 25 fractions. Good tolerance. Local control achieved."
        },
        {
            "id": "tx_004",
            "name": "Tamoxifen 20mg daily",
            "type": "Hormone Therapy",
            "start_date": "2019-03-01",
            "end_date": "2023-03-01",
            "duration": "4 years",
            "response": "Maintained remission. Switched due to bone metastases detection."
        },
        {
            "id": "tx_005",
            "name": "Letrozole 2.5mg + Palbociclib 125mg",
            "type": "Targeted Therapy",
            "start_date": "2023-06-01",
            "duration": "Ongoing",
            "response": "Currently on treatment. Bone metastases stable. CA 15-3 trending up slowly. Tolerating well with mild neutropenia."
        }
    ]
    
    # Generate clinical notes
    note_templates = [
        "Follow-up visit. Patient reports {symptoms}. Physical exam {exam_finding}. Continue current management.",
        "Oncology consultation. Reviewed imaging and labs. {assessment}. Plan: {plan}.",
        "Treatment day. Patient tolerating {treatment} well. {side_effects}. Next visit in {next_visit}.",
        "Phone encounter. Patient called regarding {concern}. Advised {advice}.",
    ]
    
    note_id = 1
    for year in range(8):
        notes_this_year = random.randint(8, 12)
        for _ in range(notes_this_year):
            days_offset = year * 365 + random.randint(0, 365)
            note_date = base_date + timedelta(days=days_offset)
            
            author = random.choice([
                "Dr. Chen, Medical Oncology",
                "Dr. Williams, Radiation Oncology",
                "Dr. Patel, Primary Care",
                "NP Johnson, Oncology"
            ])
            
            symptoms = random.choice(["no new symptoms", "mild fatigue", "joint pain", "hot flashes"])
            exam_finding = random.choice(["unremarkable", "stable", "no concerning findings"])
            assessment = random.choice(["Stable disease", "Responding to treatment", "Needs close monitoring"])
            plan = random.choice(["Continue current regimen", "Follow up in 3 months", "Repeat imaging in 6 weeks"])
            
            content = random.choice(note_templates).format(
                symptoms=symptoms,
                exam_finding=exam_finding,
                assessment=assessment,
                plan=plan,
                treatment="chemotherapy" if year < 2 else "hormone therapy",
                side_effects="No significant side effects",
                next_visit="4 weeks",
                concern=random.choice(["medication refill", "test results", "symptom question"]),
                advice=random.choice(["Continue as prescribed", "Schedule appointment", "Monitor and call back if worse"])
            )
            
            patient["notes"].append({
                "id": f"note_{note_id:03d}",
                "date": note_date.strftime("%Y-%m-%d"),
                "author": author,
                "content": content
            })
            note_id += 1
    
    # Sort all lists by date
    patient["scans"].sort(key=lambda x: x["date"])
    patient["labs"].sort(key=lambda x: x["date"])
    patient["notes"].sort(key=lambda x: x["date"])
    
    return patient


def save_demo_data(patient: dict):
    """Save demo data to JSON file."""
    # Create directory if it doesn't exist
    os.makedirs("patients", exist_ok=True)
    
    filepath = os.path.join("patients", "sarah_thompson.json")
    
    with open(filepath, "w") as f:
        json.dump(patient, f, indent=2)
    
    print(f"Demo data saved to {filepath}")
    print(f"Patient: {patient['profile']['name']}")
    print(f"Scans: {len(patient['scans'])}")
    print(f"Labs: {len(patient['labs'])}")
    print(f"Treatments: {len(patient['treatments'])}")
    print(f"Notes: {len(patient['notes'])}")
    
    # Calculate approximate token count
    total_chars = len(json.dumps(patient))
    approx_tokens = total_chars // 4
    print(f"Approximate tokens: {approx_tokens:,}")


if __name__ == "__main__":
    print("Generating Sarah Thompson's 8-year cancer journey...")
    patient = generate_sarah_thompson()
    save_demo_data(patient)
    print("Done!")
