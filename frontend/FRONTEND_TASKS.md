# Frontend Team Task Tracker

## Team: Parth & Kartik

---

## Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/sarthakskd20/medvision-ai.git
cd medvision-ai

# 2. Switch to frontend branch
git checkout frontend-dev

# 3. Navigate to frontend
cd frontend

# 4. Install dependencies
npm install

# 5. Create .env.local file
copy .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# 6. Run the dev server
npm run dev

# 7. Open browser
# http://localhost:3000
```

---

## Design Guidelines

### DO NOT MAKE IT LOOK AI-GENERATED

Follow these rules strictly:

1. **No Emojis** - Use Lucide icons only
2. **No Markdown patterns** - No excessive bold/italic
3. **No AI buzzwords** - Never use "seamless", "leverage", "utilize"
4. **Professional typography** - Inter font, proper hierarchy
5. **Limited color palette** - Teal primary, warm sand secondary
6. **Generous whitespace** - Don't cram elements
7. **Subtle animations** - Nothing flashy

### Color Palette

```css
--primary: #006064;      /* Deep Teal - Trust */
--secondary: #F5F1E8;    /* Warm Sand - Comfort */
--accent: #CC5500;       /* Burnt Orange - Alerts */
--text-dark: #1a1a1a;    /* Near Black */
--text-light: #6b7280;   /* Gray */
--background: #fafafa;   /* Off White */
```

---

## Phase 1: Foundation (COMPLETED)

- [x] Next.js 14 project initialized
- [x] Tailwind CSS configured
- [x] shadcn/ui components added
- [x] Project structure created
- [x] Environment configuration

---

## Phase 2: Page Development

### 2.1 Landing Page (`/`)

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Hero section | | [x] | Clinical Time Machine pitch |
| Features section | | [x] | 3 core features |
| How it works | | [x] | Visual steps |
| CTA buttons | | [x] | Doctor / Patient portals |

### 2.2 Dashboard (`/dashboard`)

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Layout with sidebar | | [x] | Navigation |
| Patient list | | [x] | Searchable cards |
| Recent activity | | [ ] | Timeline preview |
| Quick stats | | [ ] | Token count, patients |

### 2.3 Patient Detail (`/dashboard/patient/[id]`)

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Patient header | | [x] | Name, diagnosis, markers |
| Timeline component | | [x] | **CORE FEATURE** |
| AI summary card | | [x] | With token counter |
| Tabs navigation | | [x] | Timeline, Predict, Labs |

### 2.4 Patient Portal (`/patient-portal`)

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Upload page | | [x] | Drag-drop PDF |
| Results page | | [x] | Color-coded display |
| Medical dictionary | | [ ] | Term tooltips |
| Ask AI chat | | [ ] | Simple chat interface |

---

## Phase 3: Core Components

### 3.1 Timeline Component

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Vertical timeline design | | [x] | With connecting line |
| Event cards (scan, lab, treatment) | | [x] | Color-coded |
| Expand/collapse details | | [x] | Smooth animation |
| Date grouping | | [ ] | By year/month |

### 3.2 Token Counter

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Animated counter | | [ ] | **DEMO HIGHLIGHT** |
| Progress visualization | | [ ] | Show 2M capacity |
| Real-time update | | [ ] | As data loads |

### 3.3 Result Cards

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Normal/Elevated/Low states | | [x] | Color-coded |
| Value with reference range | | [x] | Clear display |
| Explanation text | | [x] | Plain language |
| Action recommendations | | [x] | Next steps |

### 3.4 Charts

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Lab trend line chart | | [ ] | Recharts |
| Trajectory prediction chart | | [ ] | Treatment comparison |
| Disease progression | | [ ] | Timeline view |

---

## Phase 4: API Integration

### 4.1 API Client (`lib/api.ts`)

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Base configuration | | [x] | With error handling |
| Patient endpoints | | [x] | List, get, timeline |
| Analysis endpoints | | [x] | Summary, predict |
| Report endpoints | | [x] | Upload, interpret |
| Chat endpoints | | [x] | Message, ask |

### 4.2 React Query Hooks

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| usePatients | | [x] | List hook |
| usePatient | | [x] | Single patient |
| useTimeline | | [x] | Patient timeline |
| useSummary | | [ ] | AI summary |
| useInterpretReport | | [ ] | Report mutation |

---

## Phase 5: Polish

### 5.1 Loading States

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Page loading skeleton | | [ ] | Full page |
| Card loading skeleton | | [ ] | Component level |
| Button loading spinner | | [ ] | Actions |
| Optimistic updates | | [ ] | Better UX |

### 5.2 Error Handling

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Error boundaries | | [ ] | Page level |
| Toast notifications | | [ ] | User feedback |
| Retry mechanisms | | [ ] | API failures |
| Offline indicator | | [ ] | Network status |

### 5.3 Responsive Design

| Task | Assignee | Status | Notes |
|------|----------|--------|-------|
| Mobile navigation | | [ ] | Hamburger menu |
| Timeline mobile view | | [ ] | Compact cards |
| Dashboard mobile | | [ ] | Stacked layout |

---

## Component Inventory

```
frontend/src/
├── app/
│   ├── page.tsx               # Landing
│   ├── dashboard/
│   │   ├── page.tsx           # Dashboard
│   │   └── patient/[id]/
│   │       └── page.tsx       # Patient detail
│   └── patient-portal/
│       ├── page.tsx           # Upload
│       └── results/[id]/
│           └── page.tsx       # Results
├── components/
│   ├── ui/                    # shadcn
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── timeline/
│   │   ├── PatientTimeline.tsx
│   │   └── TimelineEvent.tsx
│   ├── charts/
│   │   ├── LabTrendChart.tsx
│   │   └── TokenCounter.tsx
│   └── patient-portal/
│       ├── FileUpload.tsx
│       └── ResultCard.tsx
└── lib/
    ├── api.ts
    ├── utils.ts
    └── types.ts
```

---

## Daily Standup Template

```
## Date: YYYY-MM-DD

### Parth
- Yesterday:
- Today:
- Blockers:

### Kartik
- Yesterday:
- Today:
- Blockers:
```

---

## Communication

- **Sync with Full Stack (Sarthak/Tanmay):** Before merging to main
- **Sync with Backend (Vedang/Harshal/Ruturaj):** When API changes happen
- **Branch:** Push to `frontend-dev`, merge to `main` after testing

---

## Priority Order

1. **HIGH:** Token counter animation (demo highlight)
2. **HIGH:** Clinical timeline complete
3. **MEDIUM:** Patient portal polish
4. **MEDIUM:** Loading states
5. **LOW:** Charts and predictions
6. **LOW:** Mobile responsiveness

---

*Last Updated: 2026-01-05*
