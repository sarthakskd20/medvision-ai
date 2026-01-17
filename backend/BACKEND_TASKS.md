# Backend Team Task Tracker

## Team: Vedang, Harshal & Ruturaj

---

## Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/sarthakskd20/medvision-ai.git
cd medvision-ai

# 2. Navigate to backend
cd backend

# 3. Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create .env file
copy .env.example .env
# Add your GEMINI_API_KEY

# 6. Run the server
uvicorn app.main:app --reload --port 8000

# 7. Open API docs
# http://localhost:8000/docs
```

---

## Phase 1: Foundation (COMPLETED)

- [x] Project structure created
- [x] FastAPI app initialized (`app/main.py`)
- [x] Configuration with Pydantic (`app/config.py`)
- [x] CORS middleware configured

---

## Phase 2: Core API Development

### 2.1 Patient Routes (`app/routers/patients.py`)

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Test `GET /api/patients` | | [ ] | List all patients |
| Test `GET /api/patients/{id}` | | [ ] | Get single patient |
| Test `GET /api/patients/{id}/timeline` | | [ ] | **CORE FEATURE** - Full timeline |
| Test `GET /api/patients/{id}/full-context` | | [ ] | Token count display |
| Add error handling | | [ ] | 404, 500 responses |

### 2.2 Analysis Routes (`app/routers/analysis.py`)

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Test `POST /api/analysis/summary` | | [ ] | Clinical summary generation |
| Test `POST /api/analysis/predict-trajectory` | | [ ] | **WOW FEATURE** - Predictions |
| Implement thinking mode parsing | | [ ] | Extract reasoning |
| Add treatment options input | | [ ] | Compare treatments |

### 2.3 Reports Routes (`app/routers/reports.py`)

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Test `POST /api/reports/upload-and-interpret` | | [ ] | PDF upload |
| Test `POST /api/reports/interpret-text` | | [ ] | Direct text input |
| Validate file types | | [ ] | PDF, PNG, JPG only |
| Add file size limits | | [ ] | Max 10MB |

### 2.4 Chat Routes (`app/routers/chat.py`)

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Test `POST /api/chat/message` | | [ ] | Basic chat |
| Test with patient context | | [ ] | Context-aware chat |
| Test `POST /api/chat/ask-about-result` | | [ ] | Lab result questions |

---

## Phase 3: Gemini 3 Integration

### 3.1 Core Gemini Service (`app/services/gemini_service.py`)

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Test API connection | | [ ] | With your API key |
| Verify 2M token context | | [ ] | Load full patient data |
| Test thinking mode | | [ ] | `<thinking>` tags parsing |
| Implement retry logic | | [ ] | Handle rate limits |
| Add timeout handling | | [ ] | 60s default |

### 3.2 Prompt Engineering (`app/prompts/`)

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Test clinical_summary.py | | [ ] | Verify output format |
| Test trajectory_prediction.py | | [ ] | Treatment comparison |
| Test report_simplification.py | | [ ] | Patient-friendly output |
| Tune temperature settings | | [ ] | 0.3 for accuracy |

### 3.3 Context Building

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Test `build_patient_context()` | | [ ] | Full history formatting |
| Verify token counting | | [ ] | Accurate estimates |
| Optimize context size | | [ ] | Remove redundancy |

---

## Phase 4: Firebase Integration

### 4.1 Firebase Service (`app/services/firebase_service.py`)

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Set up Firebase project | | [ ] | Create in console |
| Configure Firestore | | [ ] | Database setup |
| Test patient CRUD | | [ ] | With real Firebase |
| Load demo data to Firestore | | [ ] | Sarah Thompson |

### 4.2 Authentication (Optional for Demo)

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Firebase Auth setup | | [ ] | If time permits |
| JWT token validation | | [ ] | Middleware |

---

## Phase 5: Testing & Polish

### 5.1 API Testing

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Test all endpoints manually | | [ ] | Using /docs |
| Create test script | | [ ] | Automated tests |
| Load testing | | [ ] | Multiple requests |

### 5.2 Error Handling

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Consistent error responses | | [ ] | Pydantic models |
| Logging implementation | | [ ] | Debug logs |
| Graceful degradation | | [ ] | Fallback responses |

### 5.3 Documentation

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| API documentation | | [ ] | Docstrings |
| README for backend | | [ ] | Setup guide |
| Environment variables | | [ ] | All documented |

---

## Demo Data

**Location:** `demo-data/patients/sarah_thompson.json`

| Data Type | Count | Purpose |
|-----------|-------|---------|
| Scans | 20 | Imaging history |
| Labs | 96 | 8 years monthly labs |
| Treatments | 5 | Cancer treatment history |
| Notes | 79 | Clinical documentation |
| **Total Tokens** | ~28K | For Gemini 3 context |

---

## API Endpoints Summary

```
GET  /                           → API info
GET  /health                     → Health check

GET  /api/patients               → List patients
GET  /api/patients/{id}          → Get patient
GET  /api/patients/{id}/timeline → Get timeline (CORE)
GET  /api/patients/{id}/full-context → Get full context

POST /api/analysis/summary       → Generate summary
POST /api/analysis/predict-trajectory → Predict outcomes (WOW)
POST /api/analysis/compare-scans → Compare scans

POST /api/reports/upload-and-interpret → Upload & interpret
POST /api/reports/interpret-text → Interpret text

POST /api/chat/message           → Chat with AI
POST /api/chat/ask-about-result  → Ask about lab result
```

---

## Daily Standup Template

```
## Date: YYYY-MM-DD

### Vedang
- Yesterday:
- Today:
- Blockers:

### Harshal
- Yesterday:
- Today:
- Blockers:

### Ruturaj
- Yesterday:
- Today:
- Blockers:
```

---

## Communication

- **Sync with Full Stack (Sarthak/Tanmay):** When API changes are made
- **Sync with Frontend (Parth/Kartik):** When endpoints are ready for integration
- **Branch:** Push to `backend-dev` branch, merge to `main` after testing

---

## Priority Order

1. **HIGH:** Get Gemini 3 API working with demo data
2. **HIGH:** Test timeline and summary endpoints
3. **MEDIUM:** Patient report interpreter
4. **MEDIUM:** Trajectory prediction with thinking mode
5. **LOW:** Firebase real integration (can use in-memory for demo)

---

*Last Updated: 2026-01-05*
