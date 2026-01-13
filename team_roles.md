# MedVision AI - Team Roles and Responsibilities

## 7-Member Team Structure for 48-Hour Hackathon

---

## Team Overview

| Role | Member(s) | Primary Focus | Secondary Focus |
|------|-----------|---------------|-----------------|
| **Full Stack Lead** | Sarthak & Tanmay | Coordination, Integration, End-to-End | Bug fixes, Demo prep |
| **Frontend Team** | Parth & Kartik | Next.js UI, Patient Portal, Timeline | Polish, Animations |
| **Backend Team** | Vedang, Harshal & Ruturaj | FastAPI, Gemini 3, Firebase, API | AI Prompts, Data |

---

## Detailed Role Assignments

### Role 1: Team Lead / Full Stack Developer

**Primary Responsibilities:**
- Overall project coordination and timeline management
- Integration between frontend and backend
- Code reviews and merge conflict resolution
- Demo rehearsal coordination

**Technical Tasks:**
```
Phase 1 (Hours 0-8):
- Set up GitHub repository with branch protection
- Create project boards for task tracking
- Help with initial scaffolding

Phase 2 (Hours 8-24):
- Integrate frontend API calls with backend endpoints
- Fix cross-cutting bugs
- Ensure data flows correctly end-to-end

Phase 3 (Hours 24-36):
- Lead integration testing
- Coordinate UI polish efforts
- Prepare backup demo plans

Phase 4 (Hours 36-48):
- Lead demo rehearsals
- Final bug triage
- Submission preparation
```

**Tools/Skills Required:**
- Git/GitHub proficiency
- Both Next.js and FastAPI basics
- Project management

---

### Role 2: Frontend Lead

**Primary Responsibilities:**
- Next.js 14 application architecture
- Clinical Timeline component (CORE FEATURE)
- Token counter visualization
- Navigation and routing

**Technical Tasks:**
```
Phase 1 (Hours 0-8):
- Initialize Next.js 14 project with App Router
- Set up Tailwind CSS + shadcn/ui
- Create base layout and navigation
- Implement authentication UI

Phase 2 (Hours 8-24):
- Build PatientTimeline component with animations
- Create token counter with real-time updates
- Implement AI summary display cards
- Build patient search and selection

Phase 3 (Hours 24-36):
- Add loading states and skeleton loaders
- Implement smooth transitions
- Dark mode consistency
- Mobile responsiveness for key screens

Phase 4 (Hours 36-48):
- Final polish on timeline animations
- Fix any UI bugs
- Support video recording
```

**Key Deliverables:**
- `/dashboard` page with patient list
- `/patient/[id]` with timeline view
- Token counter animation component
- AI summary card component

**Tools/Skills Required:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Query for data fetching

---

### Role 3: Frontend Developer (Patient Portal)

**Primary Responsibilities:**
- Patient-facing portal UI
- Lab report upload interface
- Simplified results display
- Medical term dictionary popup

**Technical Tasks:**
```
Phase 1 (Hours 0-8):
- Set up patient portal routes
- Create file upload component with drag-and-drop
- Design result card components

Phase 2 (Hours 8-24):
- Build PDF upload interface
- Create color-coded result display (green/yellow/red)
- Implement medical term popup/tooltip
- Build "Ask AI" chat interface

Phase 3 (Hours 24-36):
- Add loading states for upload processing
- Polish result cards with animations
- Ensure accessibility (WCAG)
- Test on mobile devices

Phase 4 (Hours 36-48):
- Final polish
- Support video recording for patient portal demo
```

**Key Deliverables:**
- `/patient-portal` landing page
- `/patient-portal/upload` with drag-drop
- `/patient-portal/results/[id]` with simplified display
- Medical dictionary component

**Tools/Skills Required:**
- React components
- File upload handling
- CSS animations
- Accessibility best practices

---

### Role 4: Backend Lead

**Primary Responsibilities:**
- FastAPI application architecture
- RESTful API endpoint design
- Firebase integration (Auth + Firestore)
- Request/response validation

**Technical Tasks:**
```
Phase 1 (Hours 0-8):
- Initialize FastAPI project structure
- Configure CORS and middleware
- Set up Firebase Admin SDK
- Create Pydantic models for all entities

Phase 2 (Hours 8-24):
- Implement patient CRUD endpoints
- Build timeline data aggregation endpoint
- Create report upload endpoint
- Implement authentication middleware

Phase 3 (Hours 24-36):
- Add caching for frequent queries
- Implement error handling and logging
- Optimize response times
- Add request validation

Phase 4 (Hours 36-48):
- Final API testing
- Documentation cleanup
- Support deployment
```

**Key Deliverables:**
- `/api/patients` endpoints
- `/api/patients/{id}/timeline` endpoint
- `/api/reports/upload` endpoint
- `/api/chat` endpoint
- Firebase service layer

**Tools/Skills Required:**
- FastAPI
- Pydantic
- Firebase Admin SDK
- Async Python

---

### Role 5: AI/ML Engineer

**Primary Responsibilities:**
- Gemini 3 API integration
- Prompt engineering for all features
- Context building for 2M token window
- Thinking mode implementation

**Technical Tasks:**
```
Phase 1 (Hours 0-8):
- Set up Gemini 3 API client
- Test basic API calls
- Create base prompt templates
- Implement error handling and retries

Phase 2 (Hours 8-24):
- Build patient context aggregation function
- Create clinical summary prompt
- Implement trajectory prediction prompt
- Build report simplification prompt
- Add thinking mode wrapper

Phase 3 (Hours 24-36):
- Tune prompts for better outputs
- Add structured output parsing
- Implement token counting for display
- Test with full demo data

Phase 4 (Hours 36-48):
- Final prompt refinements
- Prepare fallback responses
- Document prompt templates
```

**Key Deliverables:**
- `gemini.py` service with all API wrappers
- `prompts/clinical_summary.py`
- `prompts/trajectory_prediction.py`
- `prompts/report_simplification.py`
- Token counting utility

**Critical Code:**
```python
async def call_gemini(prompt: str, context: str, temperature: float = 0.7) -> str:
    """Main Gemini 3 API wrapper - YOUR CORE RESPONSIBILITY"""
    pass

def build_patient_context(patient_data: dict) -> str:
    """Build 1M+ token context from patient history"""
    pass

async def call_gemini_with_thinking(prompt: str, context: str) -> dict:
    """Thinking mode for transparent AI reasoning"""
    pass
```

**Tools/Skills Required:**
- Python async programming
- Prompt engineering
- JSON parsing
- Understanding of medical terminology basics

---

### Role 6: DevOps / Data Engineer

**Primary Responsibilities:**
- Deployment to Vercel + Render
- Demo data generation
- Firebase setup and configuration
- Environment management

**Technical Tasks:**
```
Phase 1 (Hours 0-8):
- Create Firebase project
- Set up Firestore database structure
- Configure Cloud Storage bucket
- Create .env templates

Phase 2 (Hours 8-24):
- Generate Sarah Thompson demo data (8 years)
- Load demo data into Firestore
- Upload sample reports to Cloud Storage
- Set up development environments for team

Phase 3 (Hours 24-36):
- Deploy backend to Render.com
- Deploy frontend to Vercel
- Configure production environment variables
- Test deployed application

Phase 4 (Hours 36-48):
- Monitor deployed services
- Quick fixes for deployment issues
- Prepare backup deployment
- Document deployment process
```

**Key Deliverables:**
- `demo-data/generate_demo_data.py` script
- `sarah_thompson.json` with 8 years of realistic data
- Firebase project fully configured
- Working Vercel + Render deployments

**Demo Data Requirements:**
```
Sarah Thompson (8-year cancer journey):
- 23 imaging scans
- 96+ lab reports (monthly)
- 5 treatment protocols
- 50+ clinical notes
- Realistic progression and values
```

**Tools/Skills Required:**
- Firebase/Firestore
- Vercel/Render deployment
- Python scripting
- Environment configuration

---

### Role 7: UI/UX Designer + Video Producer

**Primary Responsibilities:**
- Design system and component styling
- Color palette and typography
- Demo video recording and editing
- Presentation materials

**Technical Tasks:**
```
Phase 1 (Hours 0-8):
- Create color palette (medical/trust themed)
- Define typography scale
- Design component mockups in Figma/similar
- Create token counter animation concept

Phase 2 (Hours 8-24):
- Work with Frontend Lead on component styling
- Design patient portal cards
- Create timeline event icons
- Design urgency indicators (green/yellow/red)

Phase 3 (Hours 24-36):
- Polish animations and micro-interactions
- Create loading state designs
- Design error states
- Prepare demo storyboard

Phase 4 (Hours 36-48):
- Record 3-minute demo video
- Edit with narration (use narration_script.txt)
- Upload to YouTube (unlisted)
- Create README screenshots
```

**Key Deliverables:**
- Design system document
- Color palette: Primary (Teal), Secondary (Warm Sand), Alerts
- 3-minute demo video (YouTube link)
- README screenshots/GIFs

**Tools/Skills Required:**
- Figma or similar design tool
- Video recording (OBS Studio or similar)
- Video editing
- Basic motion graphics

---

## Phase-Based Task Distribution

### Phase 1: Foundation (Hours 0-8)

| Member | Task | Deliverable |
|--------|------|-------------|
| Team Lead | Repo setup, project boards | GitHub ready |
| Frontend Lead | Next.js init, shadcn setup | Running dev server |
| Frontend Dev | Patient portal routes | Route stubs |
| Backend Lead | FastAPI init, models | Running API server |
| AI/ML Engineer | Gemini client setup | Working API calls |
| DevOps | Firebase setup, env files | Config ready |
| UI/UX | Design system, colors | Style guide |

### Phase 2: Core Features (Hours 8-24)

| Member | Task | Deliverable |
|--------|------|-------------|
| Team Lead | Integration, bug fixes | Working data flow |
| Frontend Lead | Timeline component | Interactive timeline |
| Frontend Dev | Report interpreter UI | Upload + display |
| Backend Lead | All API endpoints | Complete API |
| AI/ML Engineer | All prompts, context building | AI responses working |
| DevOps | Demo data, loading | Firestore populated |
| UI/UX | Component styling, animations | Polished look |

### Phase 3: Polish (Hours 24-36)

| Member | Task | Deliverable |
|--------|------|-------------|
| Team Lead | Integration testing | End-to-end working |
| Frontend Lead | Loading states, mobile | Responsive UI |
| Frontend Dev | Accessibility, final UI | WCAG compliant |
| Backend Lead | Error handling, optimization | Robust API |
| AI/ML Engineer | Prompt tuning, fallbacks | Reliable AI |
| DevOps | Deploy to production | Live URLs |
| UI/UX | Demo storyboard, prep | Recording ready |

### Phase 4: Submission (Hours 36-48)

| Member | Task | Deliverable |
|--------|------|-------------|
| Team Lead | Demo rehearsals, submission | Final submission |
| Frontend Lead | Bug fixes, support video | Demo support |
| Frontend Dev | Bug fixes, support video | Demo support |
| Backend Lead | API stability, docs | Documentation |
| AI/ML Engineer | Fallback responses | Reliable demo |
| DevOps | Monitoring, backups | Stable deployment |
| UI/UX | Record + edit video | YouTube link |

---

## Communication Protocol

### Daily Standups
- **Every 8 hours** during hackathon
- Each member: What did you complete? What's blocking you?
- Max 15 minutes

### Channels
- **#general** - Announcements
- **#frontend** - Frontend team
- **#backend** - Backend + AI team
- **#deployment** - DevOps + issues
- **#design** - UI/UX feedback

### Code Integration
- Feature branches: `feature/timeline`, `feature/patient-portal`, etc.
- PRs require 1 approval (Team Lead or relevant lead)
- Merge to `main` frequently (every 4-6 hours)

---

## Emergency Contacts

| Role | Backup |
|------|--------|
| Frontend Lead | Frontend Dev |
| Backend Lead | AI/ML Engineer |
| AI/ML Engineer | Backend Lead |
| DevOps | Team Lead |
| UI/UX | Frontend Lead |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Timeline loads in | < 3 seconds |
| Token counter shows | 1M+ tokens |
| AI summary generates in | < 10 seconds |
| Patient report interprets in | < 5 seconds |
| Demo video length | Exactly 3 minutes |
| Submission complete | Before deadline |

---

*Team Roles v1.0*  
*MedVision AI - Gemini 3 Hackathon*
