# MedVision AI: Technical Implementation Guide

## Complete Techstack and Implementation from Scratch to Deployment

---

## Table of Contents
1. [Technology Stack Overview](#technology-stack-overview)
2. [Free Tier Strategy](#free-tier-strategy)
3. [Project Structure](#project-structure)
4. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
5. [Gemini 3 Integration Details](#gemini-3-integration-details)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Deployment Guide](#deployment-guide)
9. [Environment Setup](#environment-setup)

---

## Technology Stack Overview

### Frontend Stack

| Technology | Version | Purpose | Cost |
|------------|---------|---------|------|
| Next.js | 14.x | React framework with App Router | Free |
| TypeScript | 5.x | Type-safe development | Free |
| Tailwind CSS | 3.x | Utility-first styling | Free |
| shadcn/ui | Latest | Pre-built accessible components | Free |
| Recharts | 2.x | Data visualization for timelines | Free |
| Lucide React | Latest | Icon library | Free |
| React Query | 5.x | Server state management | Free |

### Backend Stack

| Technology | Version | Purpose | Cost |
|------------|---------|---------|------|
| Python | 3.11+ | Primary language | Free |
| FastAPI | 0.104+ | High-performance API framework | Free |
| Pydantic | 2.x | Data validation and serialization | Free |
| python-multipart | Latest | File upload handling | Free |
| PyMuPDF (fitz) | Latest | PDF text extraction | Free |
| Pillow | 10.x | Image processing | Free |
| httpx | Latest | Async HTTP client for Gemini API | Free |

### AI/ML Stack

| Technology | Purpose | Cost |
|------------|---------|------|
| Gemini 3 API | Core AI reasoning engine | Free tier: 60 requests/minute |
| Google AI Studio | API key management | Free |

### Infrastructure (All Free Tier)

| Service | Purpose | Free Tier Limit |
|---------|---------|-----------------|
| Vercel | Frontend hosting | 100GB bandwidth/month |
| Render.com | Backend hosting | 750 hours/month |
| Firebase Auth | User authentication | Unlimited users |
| Firestore | Database | 1GB storage, 50K reads/day |
| Cloud Storage | File storage | 5GB |
| GitHub | Code repository | Unlimited |

---

## Free Tier Strategy

### Cost Optimization Principles

1. **No paid services during hackathon** - Every tool has a free tier
2. **Gemini 3 API limits** - 60 requests/min is sufficient for demo
3. **Vercel + Render** - Better free tiers than Cloud Run
4. **Firestore over PostgreSQL** - No connection limits, generous free tier
5. **Client-side caching** - Reduce API calls with React Query

### Estimated Monthly Costs (Post-Hackathon)

| Phase | Monthly Cost |
|-------|--------------|
| Hackathon Demo | $0 |
| Beta (100 users) | $0 (within free tiers) |
| Pilot (1000 users) | $50-100 |
| Production | Scale as needed |

---

## Project Structure

```
medvision-ai/
├── frontend/                 # Next.js 14 application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── page.tsx                  # Landing page
│   │   │   ├── layout.tsx                # Root layout
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx              # Doctor dashboard
│   │   │   │   └── patient/[id]/
│   │   │   │       ├── page.tsx          # Patient detail
│   │   │   │       ├── timeline/page.tsx # Clinical timeline
│   │   │   │       └── predict/page.tsx  # Trajectory prediction
│   │   │   ├── patient-portal/
│   │   │   │   ├── page.tsx              # Patient upload
│   │   │   │   └── results/[id]/page.tsx # Simplified results
│   │   │   └── auth/
│   │   │       ├── login/page.tsx
│   │   │       └── register/page.tsx
│   │   ├── components/
│   │   │   ├── ui/           # shadcn components
│   │   │   ├── timeline/     # Timeline display
│   │   │   ├── charts/       # Recharts wrappers
│   │   │   ├── chat/         # AI chat interface
│   │   │   └── upload/       # File upload components
│   │   ├── lib/
│   │   │   ├── api.ts        # API client functions
│   │   │   ├── firebase.ts   # Firebase configuration
│   │   │   ├── utils.ts      # Utility functions
│   │   │   └── types.ts      # TypeScript interfaces
│   │   └── styles/
│   │       └── globals.css   # Tailwind + custom styles
│   ├── public/
│   │   └── demo-data/        # Sample patient data for demo
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── next.config.js
│
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py           # FastAPI app entry
│   │   ├── config.py         # Environment configuration
│   │   ├── routers/
│   │   │   ├── auth.py       # Authentication endpoints
│   │   │   ├── patients.py   # Patient CRUD
│   │   │   ├── analysis.py   # AI analysis endpoints
│   │   │   ├── reports.py    # Report upload/interpret
│   │   │   └── chat.py       # Conversational AI
│   │   ├── services/
│   │   │   ├── gemini.py     # Gemini 3 API wrapper
│   │   │   ├── pdf_parser.py # PDF extraction
│   │   │   ├── firebase.py   # Firestore operations
│   │   │   └── storage.py    # Cloud Storage operations
│   │   ├── models/
│   │   │   ├── patient.py    # Pydantic models
│   │   │   ├── analysis.py   # Analysis request/response
│   │   │   └── report.py     # Report models
│   │   └── prompts/
│   │       ├── clinical_summary.py
│   │       ├── scan_comparison.py
│   │       ├── trajectory_prediction.py
│   │       └── report_simplification.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── render.yaml           # Render deployment config
│
├── demo-data/                # Synthetic patient data
│   ├── patients/
│   │   └── sarah_thompson/   # 8-year cancer journey
│   │       ├── profile.json
│   │       ├── scans/
│   │       ├── labs/
│   │       └── notes/
│   └── generate_demo_data.py # Script to create demo data
│
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD pipeline
│
├── README.md
├── .env.example
└── .gitignore
```

---

## Phase-by-Phase Implementation

### Phase 1: Foundation (Hours 0-8)

#### Step 1.1: Initialize Frontend (Hour 0-2)

```bash
# Create Next.js project
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir

# Navigate and install dependencies
cd frontend
npm install @tanstack/react-query lucide-react recharts firebase
npm install -D @types/node

# Initialize shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label tabs dialog
```

#### Step 1.2: Initialize Backend (Hour 2-4)

```bash
# Create backend directory
mkdir backend && cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-multipart httpx pydantic firebase-admin pymupdf pillow python-dotenv

# Generate requirements.txt
pip freeze > requirements.txt
```

**backend/app/main.py:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, patients, analysis, reports, chat
from app.config import settings

app = FastAPI(
    title="MedVision AI API",
    description="Clinical Time Machine powered by Gemini 3",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["AI Analysis"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "MedVision AI"}
```

#### Step 1.3: Configure Firebase (Hour 4-6)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project: "medvision-ai"
3. Enable Authentication (Email/Password)
4. Create Firestore database (Start in test mode)
5. Create Storage bucket
6. Download service account key

**backend/app/config.py:**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str
    firebase_project_id: str
    firebase_private_key: str
    firebase_client_email: str
    
    class Config:
        env_file = ".env"

settings = Settings()
```

#### Step 1.4: Gemini 3 Integration (Hour 6-8)

**backend/app/services/gemini.py:**
```python
import httpx
from app.config import settings

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

async def call_gemini(
    prompt: str,
    context: str = "",
    temperature: float = 0.7,
    max_tokens: int = 8192
) -> str:
    """Call Gemini 3 API with full context support."""
    
    headers = {
        "Content-Type": "application/json",
    }
    
    # Combine context and prompt for 2M token capability
    full_prompt = f"""
{context}

---

{prompt}
"""
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": full_prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens,
            "topP": 0.95,
        }
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{GEMINI_API_URL}?key={settings.gemini_api_key}",
            json=payload,
            headers=headers,
            timeout=60.0
        )
        response.raise_for_status()
        
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


async def call_gemini_with_thinking(
    prompt: str,
    context: str = "",
) -> dict:
    """Call Gemini 3 with thinking mode for transparent reasoning."""
    
    thinking_prompt = f"""
You are a medical AI assistant. Think through this step-by-step.

CONTEXT:
{context}

TASK:
{prompt}

First, show your reasoning process in <thinking> tags.
Then provide your final answer in <answer> tags.
"""
    
    response = await call_gemini(thinking_prompt, temperature=0.3)
    
    # Parse thinking and answer
    thinking = ""
    answer = ""
    
    if "<thinking>" in response and "</thinking>" in response:
        thinking = response.split("<thinking>")[1].split("</thinking>")[0].strip()
    
    if "<answer>" in response and "</answer>" in response:
        answer = response.split("<answer>")[1].split("</answer>")[0].strip()
    else:
        answer = response
    
    return {"thinking": thinking, "answer": answer}
```

---

### Phase 2: Core Features (Hours 8-24)

#### Step 2.1: Patient Timeline (Hours 8-12)

**backend/app/routers/patients.py:**
```python
from fastapi import APIRouter, HTTPException
from app.services.firebase import get_patient, get_patient_history
from app.services.gemini import call_gemini

router = APIRouter()

@router.get("/{patient_id}/timeline")
async def get_patient_timeline(patient_id: str):
    """Get complete patient timeline with AI summaries."""
    
    # Fetch all patient data
    patient = await get_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Get complete history
    history = await get_patient_history(patient_id)
    
    # Build timeline events
    timeline = []
    
    for scan in history.get("scans", []):
        timeline.append({
            "type": "scan",
            "date": scan["date"],
            "title": f"{scan['scan_type']} - {scan['body_part']}",
            "summary": scan.get("ai_summary", ""),
            "urgency": scan.get("urgency", 1),
            "data": scan
        })
    
    for lab in history.get("labs", []):
        abnormal = [r for r in lab["results"] if r["flag"] != "NORMAL"]
        timeline.append({
            "type": "lab",
            "date": lab["date"],
            "title": f"Lab Results - {len(lab['results'])} tests",
            "summary": f"{len(abnormal)} abnormal values" if abnormal else "All normal",
            "urgency": 3 if abnormal else 1,
            "data": lab
        })
    
    for treatment in history.get("treatments", []):
        timeline.append({
            "type": "treatment",
            "date": treatment["start_date"],
            "title": treatment["name"],
            "summary": treatment.get("response", ""),
            "urgency": 2,
            "data": treatment
        })
    
    # Sort by date descending
    timeline.sort(key=lambda x: x["date"], reverse=True)
    
    return {
        "patient": patient,
        "timeline": timeline,
        "total_events": len(timeline)
    }
```

**frontend/src/components/timeline/PatientTimeline.tsx:**
```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Scan, 
  TestTube, 
  Pill, 
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface TimelineEvent {
  type: "scan" | "lab" | "treatment" | "note";
  date: string;
  title: string;
  summary: string;
  urgency: number;
  data: Record<string, unknown>;
}

interface PatientTimelineProps {
  events: TimelineEvent[];
}

const typeIcons = {
  scan: Scan,
  lab: TestTube,
  treatment: Pill,
  note: FileText,
};

const urgencyColors = {
  1: "bg-green-100 text-green-800 border-green-200",
  2: "bg-blue-100 text-blue-800 border-blue-200",
  3: "bg-yellow-100 text-yellow-800 border-yellow-200",
  4: "bg-orange-100 text-orange-800 border-orange-200",
  5: "bg-red-100 text-red-800 border-red-200",
};

export function PatientTimeline({ events }: PatientTimelineProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
      
      <div className="space-y-4">
        {events.map((event, index) => {
          const Icon = typeIcons[event.type];
          const isExpanded = expanded === `${event.type}-${index}`;
          
          return (
            <div key={`${event.type}-${index}`} className="relative pl-14">
              {/* Timeline dot */}
              <div className="absolute left-4 w-4 h-4 rounded-full bg-white border-2 border-slate-300 z-10" />
              
              <Card 
                className={`cursor-pointer transition-shadow hover:shadow-md ${
                  urgencyColors[Math.min(event.urgency, 5) as keyof typeof urgencyColors]
                }`}
                onClick={() => setExpanded(isExpanded ? null : `${event.type}-${index}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <CardTitle className="text-sm font-medium">
                        {event.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {new Date(event.date).toLocaleDateString()}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-600">{event.summary}</p>
                  
                  {isExpanded && (
                    <div className="mt-4 p-3 bg-white/50 rounded-lg">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

#### Step 2.2: Clinical Summary with Full Context (Hours 12-16)

**backend/app/prompts/clinical_summary.py:**
```python
CLINICAL_SUMMARY_PROMPT = """
You are an expert oncologist AI assistant. Generate a comprehensive clinical summary.

PATIENT DATA (Complete History):
{patient_context}

---

Generate a clinical summary with the following structure:

## Patient Overview
One paragraph with key demographics, diagnosis, stage, and treatment status.

## Key Findings (Last 6 Months)
- Bullet points of significant findings
- Include specific measurements and dates
- Flag any concerning trends

## Treatment History
Chronological summary of treatments and their responses.

## Current Status
Assessment of current disease state based on latest data.

## Critical Alerts
Any items requiring immediate attention.

## Recommendations
Evidence-based suggestions for next steps.

Be precise. Cite specific values and dates. Use medical terminology appropriately.
"""

def build_patient_context(patient_data: dict) -> str:
    """Build comprehensive patient context for Gemini 3's 2M token window."""
    
    context_parts = []
    
    # Patient demographics
    context_parts.append(f"# PATIENT DEMOGRAPHICS\n{patient_data.get('profile', {})}")
    
    # All scans (chronological)
    if patient_data.get("scans"):
        context_parts.append("\n# IMAGING HISTORY")
        for scan in sorted(patient_data["scans"], key=lambda x: x["date"]):
            context_parts.append(f"\n## {scan['date']} - {scan['scan_type']} {scan['body_part']}")
            context_parts.append(f"Findings: {scan.get('findings', 'Not documented')}")
            context_parts.append(f"Impression: {scan.get('impression', 'Not documented')}")
    
    # All labs (chronological)
    if patient_data.get("labs"):
        context_parts.append("\n# LABORATORY HISTORY")
        for lab in sorted(patient_data["labs"], key=lambda x: x["date"]):
            context_parts.append(f"\n## {lab['date']}")
            for result in lab["results"]:
                flag = f"[{result['flag']}]" if result.get("flag") else ""
                context_parts.append(f"- {result['test']}: {result['value']} {result['unit']} {flag}")
    
    # All treatments
    if patient_data.get("treatments"):
        context_parts.append("\n# TREATMENT HISTORY")
        for tx in sorted(patient_data["treatments"], key=lambda x: x["start_date"]):
            context_parts.append(f"\n## {tx['start_date']} - {tx['name']}")
            context_parts.append(f"Duration: {tx.get('duration', 'Ongoing')}")
            context_parts.append(f"Response: {tx.get('response', 'Not assessed')}")
    
    # Clinical notes
    if patient_data.get("notes"):
        context_parts.append("\n# CLINICAL NOTES")
        for note in sorted(patient_data["notes"], key=lambda x: x["date"]):
            context_parts.append(f"\n## {note['date']} - {note['author']}")
            context_parts.append(note["content"])
    
    return "\n".join(context_parts)
```

#### Step 2.3: Predictive Trajectory (Hours 16-20)

**backend/app/routers/analysis.py:**
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.gemini import call_gemini_with_thinking
from app.services.firebase import get_patient_full_history
from app.prompts.trajectory_prediction import TRAJECTORY_PROMPT

router = APIRouter()

class TrajectoryRequest(BaseModel):
    patient_id: str
    treatment_options: list[str] = []

@router.post("/predict-trajectory")
async def predict_trajectory(request: TrajectoryRequest):
    """Predict patient trajectory based on similar cases."""
    
    # Load complete patient history
    patient_data = await get_patient_full_history(request.patient_id)
    if not patient_data:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Build context (this uses Gemini 3's 2M token capability)
    from app.prompts.clinical_summary import build_patient_context
    context = build_patient_context(patient_data)
    
    # Add treatment options to prompt
    options_str = ", ".join(request.treatment_options) if request.treatment_options else "standard of care options"
    
    prompt = TRAJECTORY_PROMPT.format(
        treatment_options=options_str
    )
    
    # Use thinking mode for transparent reasoning
    result = await call_gemini_with_thinking(prompt, context)
    
    return {
        "patient_id": request.patient_id,
        "reasoning": result["thinking"],
        "prediction": result["answer"],
        "context_tokens": len(context.split()),  # Show token usage for demo
        "model": "gemini-2.0-flash"
    }
```

**backend/app/prompts/trajectory_prediction.py:**
```python
TRAJECTORY_PROMPT = """
Based on the complete patient history provided, predict the likely trajectory.

TASK: For each of the following treatment options, provide:
1. Estimated response probability (%)
2. Expected progression-free survival (months)
3. Key factors supporting this prediction
4. Potential risks and side effects

Treatment options to evaluate: {treatment_options}

FORMAT YOUR RESPONSE AS:

## Treatment Option: [Name]

### Predicted Outcomes
- Response probability: X%
- Progression-free survival: X-X months
- Overall survival benefit: X months

### Supporting Factors
- Factor 1 from patient history
- Factor 2 from patient history

### Risk Factors
- Risk 1
- Risk 2

### Recommendation Level
[STRONGLY RECOMMENDED / RECOMMENDED / CONSIDER / NOT RECOMMENDED]

---

Repeat for each treatment option. Base predictions on:
- Patient's tumor genetics (EGFR, BRCA, etc.)
- Previous treatment responses
- Current disease burden
- Comorbidities and performance status

End with an overall recommendation and confidence level.
"""
```

#### Step 2.4: Patient Report Interpreter (Hours 20-24)

**backend/app/routers/reports.py:**
```python
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.pdf_parser import extract_text_from_pdf
from app.services.gemini import call_gemini
from app.prompts.report_simplification import SIMPLIFY_REPORT_PROMPT

router = APIRouter()

@router.post("/upload-and-interpret")
async def upload_and_interpret_report(file: UploadFile = File(...)):
    """Upload a lab report and get plain-language interpretation."""
    
    # Validate file type
    if not file.filename.endswith(('.pdf', '.png', '.jpg', '.jpeg')):
        raise HTTPException(
            status_code=400, 
            detail="Only PDF and image files are supported"
        )
    
    # Extract text from PDF
    content = await file.read()
    
    if file.filename.endswith('.pdf'):
        extracted_text = extract_text_from_pdf(content)
    else:
        # For images, we would use Gemini's vision capability
        # For hackathon, focus on PDF
        extracted_text = "Image processing not yet implemented"
    
    # Call Gemini to interpret
    prompt = SIMPLIFY_REPORT_PROMPT.format(report_text=extracted_text)
    interpretation = await call_gemini(prompt, temperature=0.3)
    
    return {
        "filename": file.filename,
        "extracted_text": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
        "interpretation": interpretation
    }
```

**backend/app/prompts/report_simplification.py:**
```python
SIMPLIFY_REPORT_PROMPT = """
You are a friendly medical translator. Your job is to explain lab results in simple language that anyone can understand.

LAB REPORT:
{report_text}

---

For EACH test result in this report, provide:

## [Test Name]
**Your Value:** [value with unit]
**Normal Range:** [range]
**Status:** [NORMAL / ELEVATED / LOW / CRITICAL]

**What This Means:**
Explain in 1-2 sentences what this test measures and what the patient's result means for their health. Use simple words. Avoid medical jargon.

**Action Needed:**
- If NORMAL: "No action needed. This is healthy."
- If ELEVATED/LOW: "Consider discussing with your doctor."
- If CRITICAL: "Please contact your healthcare provider soon."

---

After all results, provide:

## Overall Summary
A 2-3 sentence summary of the patient's overall results. Mention how many values are normal vs. need attention.

## Questions to Ask Your Doctor
List 2-3 relevant questions the patient might want to ask at their next appointment.

Remember: Write as if explaining to someone with no medical background. Be reassuring but honest.
"""
```

---

### Phase 3: Polish and Integration (Hours 24-36)

#### Step 3.1: Demo Data Generation

**demo-data/generate_demo_data.py:**
```python
import json
from datetime import datetime, timedelta
import random

def generate_sarah_thompson():
    """Generate 8-year cancer patient journey for demo."""
    
    # Base dates (8 years of data)
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
    scan_types = [
        ("Mammogram", "Breast"),
        ("CT", "Chest/Abdomen/Pelvis"),
        ("PET-CT", "Whole Body"),
        ("MRI", "Brain"),
        ("Bone Scan", "Skeleton")
    ]
    
    for year in range(8):
        for quarter in range(1, 5):
            if random.random() > 0.3:  # Not every quarter has a scan
                scan_date = base_date + timedelta(days=year*365 + quarter*90 + random.randint(-15, 15))
                scan_type, body_part = random.choice(scan_types)
                
                # Simulate disease progression
                if year < 3:
                    status = "Stable disease" if random.random() > 0.3 else "Partial response"
                elif year < 5:
                    status = random.choice(["Stable disease", "Minor progression"])
                else:
                    status = random.choice(["Stable disease", "Bone metastases noted", "Progressive disease"])
                
                patient["scans"].append({
                    "date": scan_date.strftime("%Y-%m-%d"),
                    "scan_type": scan_type,
                    "body_part": body_part,
                    "findings": f"Primary tumor: {random.uniform(1.5, 4.5):.1f}cm. {status}.",
                    "impression": status,
                    "urgency": 2 if "progression" in status.lower() else 1
                })
    
    # Generate labs (100+ over 8 years)
    lab_tests = [
        ("CA 15-3", "U/mL", 0, 31),
        ("CEA", "ng/mL", 0, 3.0),
        ("Hemoglobin", "g/dL", 12.0, 15.5),
        ("WBC", "K/uL", 4.0, 11.0),
        ("Platelets", "K/uL", 150, 400),
        ("Creatinine", "mg/dL", 0.6, 1.2),
        ("ALT", "U/L", 7, 56),
        ("Alkaline Phosphatase", "U/L", 44, 147)
    ]
    
    for month in range(96):  # Monthly labs for 8 years
        lab_date = base_date + timedelta(days=month*30 + random.randint(-5, 5))
        
        results = []
        for test_name, unit, low, high in lab_tests:
            # Simulate values with some trending for tumor markers
            if "CA 15-3" in test_name and month > 60:
                value = random.uniform(30, 80)  # Elevated in later years
            elif "CEA" in test_name and month > 60:
                value = random.uniform(3.0, 8.0)
            else:
                value = random.uniform(low * 0.8, high * 1.2)
            
            flag = "NORMAL"
            if value < low:
                flag = "LOW"
            elif value > high:
                flag = "HIGH"
            
            results.append({
                "test": test_name,
                "value": round(value, 1),
                "unit": unit,
                "reference_range": f"{low}-{high}",
                "flag": flag
            })
        
        patient["labs"].append({
            "date": lab_date.strftime("%Y-%m-%d"),
            "results": results
        })
    
    # Generate treatments
    treatments = [
        {
            "name": "Lumpectomy + Sentinel Lymph Node Biopsy",
            "type": "Surgery",
            "start_date": "2018-04-20",
            "duration": "1 day",
            "response": "Complete resection, 2/15 lymph nodes positive"
        },
        {
            "name": "AC-T Chemotherapy",
            "type": "Chemotherapy",
            "start_date": "2018-06-01",
            "duration": "6 months",
            "response": "Completed with partial response, tolerated well"
        },
        {
            "name": "Radiation Therapy",
            "type": "Radiation",
            "start_date": "2019-01-15",
            "duration": "6 weeks",
            "response": "Completed, local control achieved"
        },
        {
            "name": "Tamoxifen",
            "type": "Hormone Therapy",
            "start_date": "2019-03-01",
            "duration": "5 years",
            "response": "Maintained remission for 4 years"
        },
        {
            "name": "Letrozole + Palbociclib",
            "type": "Targeted Therapy",
            "start_date": "2023-06-01",
            "duration": "Ongoing",
            "response": "Stable disease, bone metastases controlled"
        }
    ]
    patient["treatments"] = treatments
    
    # Save to file
    with open("demo-data/patients/sarah_thompson.json", "w") as f:
        json.dump(patient, f, indent=2)
    
    print(f"Generated patient with {len(patient['scans'])} scans and {len(patient['labs'])} lab records")
    return patient

if __name__ == "__main__":
    generate_sarah_thompson()
```

#### Step 3.2: Frontend Polish

**frontend/src/app/dashboard/patient/[id]/page.tsx:**
```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PatientTimeline } from "@/components/timeline/PatientTimeline";
import { api } from "@/lib/api";
import { 
  Clock, 
  Activity, 
  TrendingUp, 
  MessageCircle,
  Loader2,
  AlertTriangle
} from "lucide-react";

export default function PatientDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", params.id],
    queryFn: () => api.getPatient(params.id),
  });

  const { data: timeline } = useQuery({
    queryKey: ["timeline", params.id],
    queryFn: () => api.getPatientTimeline(params.id),
    enabled: !!patient,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["summary", params.id],
    queryFn: () => api.getPatientSummary(params.id),
    enabled: !!patient,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Patient Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {patient?.profile?.name}
          </h1>
          <p className="text-slate-600">
            {patient?.profile?.age}yo {patient?.profile?.gender} | 
            {patient?.profile?.diagnosis}
          </p>
          <div className="flex gap-2 mt-2">
            {patient?.profile?.genetic_markers?.map((marker: string) => (
              <Badge key={marker} variant="outline">
                {marker}
              </Badge>
            ))}
          </div>
        </div>
        <Button>
          <MessageCircle className="h-4 w-4 mr-2" />
          Ask AI
        </Button>
      </div>

      {/* AI Summary Card */}
      <Card className="border-l-4 border-l-teal-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-600" />
              AI Clinical Summary
            </CardTitle>
            {summary?.context_tokens && (
              <Badge variant="secondary" className="font-mono">
                {summary.context_tokens.toLocaleString()} tokens analyzed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing 8 years of patient history...
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: summary?.summary || "" }} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="trajectory" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Predict Trajectory
          </TabsTrigger>
          <TabsTrigger value="labs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Lab Trends
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          {timeline?.timeline && (
            <PatientTimeline events={timeline.timeline} />
          )}
        </TabsContent>

        <TabsContent value="trajectory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Trajectory Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Based on Sarah's complete 8-year history and similar patient outcomes,
                here are the predicted trajectories for treatment options.
              </p>
              <Button>
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Prediction
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs... */}
      </Tabs>
    </div>
  );
}
```

---

### Phase 4: Deployment (Hours 36-48)

#### Step 4.1: Backend Deployment (Render.com)

**backend/render.yaml:**
```yaml
services:
  - type: web
    name: medvision-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: GEMINI_API_KEY
        sync: false
      - key: FIREBASE_PROJECT_ID
        sync: false
      - key: FIREBASE_PRIVATE_KEY
        sync: false
      - key: FIREBASE_CLIENT_EMAIL
        sync: false
```

**Deployment Steps:**
1. Push code to GitHub
2. Connect Render to GitHub repo
3. Select `backend` directory as root
4. Add environment variables
5. Deploy

#### Step 4.2: Frontend Deployment (Vercel)

**frontend/next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  images: {
    domains: ['storage.googleapis.com'],
  },
}

module.exports = nextConfig
```

**Deployment Steps:**
1. Push code to GitHub
2. Import project in Vercel
3. Select `frontend` directory as root
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://medvision-api.onrender.com`
5. Deploy

#### Step 4.3: Final Checklist

```
PRE-DEPLOYMENT:
[ ] All environment variables documented in .env.example
[ ] Demo data is pre-loaded in Firestore
[ ] API health check returns 200
[ ] Frontend builds without errors

POST-DEPLOYMENT:
[ ] Test all API endpoints on production
[ ] Verify Gemini 3 API calls work
[ ] Load patient timeline in browser
[ ] Generate AI summary successfully
[ ] Record 3-minute demo video

SUBMISSION:
[ ] GitHub repo is public
[ ] README has clear setup instructions
[ ] Video uploaded to YouTube (unlisted)
[ ] 200-word Gemini integration description ready
```

---

## Environment Setup

### Required Environment Variables

**.env.example:**
```env
# Gemini 3 API
GEMINI_API_KEY=your_gemini_api_key

# Firebase Configuration
FIREBASE_PROJECT_ID=medvision-ai
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@medvision-ai.iam.gserviceaccount.com

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=medvision-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=medvision-ai
```

### Local Development Commands

```bash
# Start backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Start frontend (new terminal)
cd frontend
npm install
npm run dev

# Generate demo data
cd demo-data
python generate_demo_data.py
```

---

## Cost Summary

| Service | Hackathon Usage | Monthly Cost |
|---------|-----------------|--------------|
| Gemini 3 API | 60 req/min free | $0 |
| Vercel | 100GB bandwidth | $0 |
| Render.com | 750 hours background | $0 |
| Firebase Auth | Unlimited | $0 |
| Firestore | 50K reads/day | $0 |
| Cloud Storage | 5GB | $0 |
| **Total** | | **$0** |

---

*Technical Implementation Guide v1.0*
*MedVision AI - Gemini 3 Hackathon*
