# MedVision AI - Clinical Time Machine

> The first medical AI that uses Gemini 3's 2 million token context to transform a patient's entire health history into a predictable, understandable journey.

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Gemini API Key ([Get one here](https://aistudio.google.com/))

### Local Development

```bash
# Clone the repository
git clone https://github.com/sarthakskd20/medvision-ai.git
cd medvision-ai

# Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
uvicorn app.main:app --reload --port 8000

# Frontend Setup (new terminal)
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## The Problem

Doctors spend **45+ minutes** reviewing patient records before a 15-minute consultation. Patients receive test results they cannot understand.

## The Solution

MedVision AI leverages Gemini 3's unprecedented **2 million token context** to:
- Load 10+ years of patient history in ONE API call
- Detect patterns invisible to manual review
- Predict treatment outcomes based on similar patients
- Explain lab results in plain language

## Key Features

1. **Clinical Timeline** - Visualize complete patient journey with AI summaries
2. **Predictive Trajectory** - Treatment outcome predictions with transparent reasoning
3. **Patient Report Interpreter** - Upload lab reports, get plain-language explanations

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind, shadcn/ui |
| Backend | FastAPI, Python 3.11, Pydantic |
| AI | Gemini 3 API (2M token context) |
| Database | Firebase Firestore |
| Hosting | Vercel (Frontend), Render (Backend) |

## Team

| Role | Members |
|------|---------|
| Full Stack | Sarthak, Tanmay |
| Frontend | Parth, Kartik |
| Backend | Vedang, Harshal, Ruturaj |

## Documentation

- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- [Technical Implementation](./technical_implementation.md)
- [Team Roles](./team_roles.md)
- [Idea Document](./idea.md)

## Hackathon

Built for the **Gemini 3 Global Hackathon** by Google DeepMind.

---

*MedVision AI: Every minute saved is a life that could be changed.*
