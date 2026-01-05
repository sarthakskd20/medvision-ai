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
4. Start backend on `http://localhost:8000`
5. Start frontend on `http://localhost:3000`
6. Open your browser

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
uvicorn app.main:app --reload --port 8000
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

## The Problem

Doctors spend **45+ minutes** reviewing patient records before a 15-minute consultation. Patients receive test results they cannot understand.

## The Solution

MedVision AI leverages Gemini 3's unprecedented **2 million token context** to:
- Load 10+ years of patient history in ONE API call
- Detect patterns invisible to manual review  
- Predict treatment outcomes based on similar patients
- Explain lab results in plain language

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Clinical Timeline** | Visualize complete patient journey with AI summaries |
| **Predictive Trajectory** | Treatment outcome predictions with transparent reasoning |
| **Patient Report Interpreter** | Upload lab reports, get plain-language explanations |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind, shadcn/ui |
| Backend | FastAPI, Python 3.11, Pydantic |
| AI | Gemini 3 API (2M token context) |
| Database | Firebase Firestore |
| Hosting | Vercel (Frontend), Render (Backend) |

---

## Project Structure

```
MedVision AI/
├── run_app.bat              # ONE-CLICK SETUP
├── TASKS.md                 # Master checklist (all teams)
├── ROADMAP.md               # Project roadmap
├── backend/
│   ├── BACKEND_TASKS.md     # Backend team tasks
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   └── prompts/         # AI prompts
│   └── requirements.txt
├── frontend/
│   ├── FRONTEND_TASKS.md    # Frontend team tasks
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities & API client
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
