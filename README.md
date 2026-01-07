# MedVision AI - Clinical Time Machine

> The first medical AI that uses Gemini 3's 2 million token context to transform a patient's entire health history into a predictable, understandable journey.

---

## One-Click Setup

### Windows
```bash
# Just double-click this file!
run_app.bat
```

This will automatically:
1. Check for Node.js, npm, Python, pip
2. Install all dependencies
3. Set up environment files
4. Start backend on `http://localhost:8001`
5. Start frontend on `http://localhost:3000`
6. Open your browser

---

## Demo Credentials (For Testing/Judges)

| Email | Password | Role |
|-------|----------|------|
| `dr.chen@medvision.ai` | `Demo@2025` | Doctor (Pre-verified) |
| `dr.smith@medvision.ai` | `Demo@2025` | Doctor (Pre-verified) |

**Magic Code for Instant Verification**: `GEMINI2025`
(Enter this during doctor registration to skip document verification)

---

## Manual Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- [Gemini API Key](https://aistudio.google.com/)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
cp .env.example .env         # Add your GEMINI_API_KEY
uvicorn app.main:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Features

### For Doctors
| Feature | Description |
|---------|-------------|
| **Doctor Registration** | Multi-step wizard with AI-powered document verification |
| **Global Verification** | Supports doctors from 50+ countries with Gemini 3 Vision |
| **Clinical Timeline** | Visualize complete patient journey with AI summaries |
| **AI Summary** | Generate comprehensive clinical summaries in seconds |
| **PDF Export** | Download AI summaries as formatted PDF documents |

### For Patients
| Feature | Description |
|---------|-------------|
| **Report Interpreter** | Upload lab reports, get plain-language explanations |
| **Patient Portal** | Access and understand your own health data |

---

## The Problem

Doctors spend **45+ minutes** reviewing patient records before a 15-minute consultation. Patients receive test results they cannot understand.

## The Solution

MedVision AI leverages Gemini 3's unprecedented **2 million token context** to:
- Load 10+ years of patient history in ONE API call
- Detect patterns invisible to manual review  
- Predict treatment outcomes based on similar patients
- Explain lab results in plain language
- Verify medical credentials using AI document analysis

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11, PyJWT |
| AI | Gemini 3 API (2M token context, Vision) |
| Auth | JWT tokens with demo account bypass |
| Hosting | Vercel (Frontend), Render (Backend) |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new doctor |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/verify-documents` | AI document verification |
| GET | `/api/auth/countries` | List of supported countries |
| GET | `/api/auth/specializations` | Medical specializations |

### Patients & Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List all patients |
| GET | `/api/patients/{id}/timeline` | Get patient timeline |
| POST | `/api/analysis/summary` | Generate AI summary |
| POST | `/api/reports/interpret` | Interpret uploaded report |

---

## Project Structure

```
MedVision AI/
├── run_app.bat              # ONE-CLICK SETUP
├── package.json             # Root package (npm commands)
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── routers/         # API endpoints
│   │   │   ├── auth.py      # Authentication routes
│   │   │   ├── patients.py  # Patient routes
│   │   │   └── analysis.py  # AI analysis routes
│   │   ├── services/        # Business logic
│   │   │   ├── auth_service.py         # JWT & login
│   │   │   ├── verification_service.py # Gemini Vision
│   │   │   └── gemini_service.py       # AI summaries
│   │   └── models/          # Data models
│   │       └── user.py      # Doctor, Patient models
│   └── requirements.txt
├── frontend/
│   ├── src/app/
│   │   ├── auth/            # Login, Register, Pending pages
│   │   ├── dashboard/       # Doctor dashboard
│   │   └── patient-portal/  # Patient interface
│   └── package.json
└── demo-data/               # Demo patient data
```

---

## Team

| Role | Members | Branch |
|------|---------|--------|
| Full Stack Lead | Sarthak, Tanmay | `main` |
| Frontend | Parth, Kartik | `frontend-dev` |
| Backend | Vedang, Harshal, Ruturaj | `backend-dev` |

---

## Documentation

- [Roadmap](./ROADMAP.md) - Phase-by-phase project plan
- [Tasks](./TASKS.md) - Master checklist for all teams
- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Technical strategy
- [Technical Guide](./technical_implementation.md) - Detailed implementation
- [Idea Document](./idea.md) - Core concept and value proposition

---

## Hackathon

Built for the **Gemini 3 Global Hackathon** by Google DeepMind.

---

*MedVision AI: Every minute saved is a life that could be changed.*
