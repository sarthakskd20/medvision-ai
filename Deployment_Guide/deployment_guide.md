# MedVision AI - Free Deployment Guide

## Project Structure Analysis

| Component | Technology | Deployment Requirements |
|-----------|------------|------------------------|
| Frontend | Next.js 16 | Node.js runtime, static + SSR |
| Backend | FastAPI/Python | Python 3.9+, persistent storage |
| Database | SQLite | File-based, needs persistent disk |
| Auth | Firebase | External service (free tier) |
| AI | Gemini API | External API (free tier available) |

---

## Free Deployment Options Comparison

### Option 1: Vercel + Render.com (RECOMMENDED)

| Service | Component | Free Tier | Limits |
|---------|-----------|-----------|--------|
| **Vercel** | Frontend | Unlimited | 100GB bandwidth, hobby use |
| **Render.com** | Backend | Free | 750 hrs/month, sleeps after 15min |

**Pros:**
- No credit card required
- Automatic HTTPS
- Easy GitHub integration
- No pay-as-you-go risk

**Cons:**
- Backend sleeps after 15min of inactivity (cold start ~30s)
- SQLite file resets on redeploy (need to use external DB for production)

---

### Option 2: Railway.app

| Component | Free Tier | Limits |
|-----------|-----------|--------|
| Frontend + Backend | $5/month credits | 500 hours execution |

**Pros:**
- Single platform for both
- Persistent storage included
- No cold starts

**Cons:**
- Need credit card to start trial
- May exceed free tier with heavy use

---

### Option 3: Google Cloud ($300 Credits)

| Service | Free Credits | Usage |
|---------|--------------|-------|
| **Cloud Run** | $300 for 90 days | Backend (FastAPI) |
| **Firebase Hosting** | Free | Frontend (Next.js static) |
| **Cloud SQL** | Part of credits | PostgreSQL (optional) |

**Pros:**
- $300 covers 2+ months easily
- Production-grade infrastructure
- No cold starts with minimum instances
- Persistent database

**Cons:**
- More complex setup
- Need to monitor credit usage
- Auto-billing after credits expire (can disable)

---

## Recommendation

For a **2-month demo/competition** with zero payment risk:

> **Use Vercel (Frontend) + Render.com (Backend)**

This combination:
- Requires no credit card
- Has no automatic billing
- Deploys in under 30 minutes
- Handles moderate traffic (100+ users/day)

---

## Step-by-Step Deployment Guide

### Part 1: Deploy Frontend to Vercel

#### Step 1.1: Prepare Frontend for Deployment

Create/update `frontend/next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
}
module.exports = nextConfig
```

#### Step 1.2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New Project"
3. Import your `medvision-ai` repository
4. Set **Root Directory** to `frontend`
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
6. Click "Deploy"

---

### Part 2: Deploy Backend to Render.com

#### Step 2.1: Create Backend Configuration Files

Create `backend/render.yaml`:
```yaml
services:
  - type: web
    name: medvision-backend
    runtime: python
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

Create `backend/Procfile`:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

#### Step 2.2: Deploy to Render

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click "New +" → "Web Service"
3. Connect your `medvision-ai` repository
4. Configure:
   - **Name:** `medvision-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   ```
   GEMINI_API_KEY=your_gemini_key
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
   DEBUG_GEMINI=false
   ENVIRONMENT=production
   ```
6. Select "Free" tier
7. Click "Create Web Service"

---

### Part 3: Connect Frontend to Backend

After both are deployed:

1. Copy your Render backend URL (e.g., `https://medvision-backend.onrender.com`)
2. Go to Vercel Dashboard → Project Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with your Render URL
4. Redeploy frontend

---

### Part 4: Update CORS Settings

Update `backend/app/main.py` to allow your Vercel domain:

```python
origins = [
    "http://localhost:3000",
    "https://your-project.vercel.app",
    "https://*.vercel.app"
]
```

---

## SQLite Persistence Note

> [!WARNING]
> Render's free tier does **not** persist files between deploys. Your SQLite database will reset on each deploy.

**Solutions:**
1. **For demo/competition:** Pre-seed database on startup
2. **For production:** Use external database (Supabase free tier, PlanetScale, or Render PostgreSQL)

---

## Google Cloud Alternative (If Using $300 Credits)

If you prefer Google Cloud with the $300 credits:

### Backend: Cloud Run

```bash
# Install gcloud CLI, then:
cd backend
gcloud run deploy medvision-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=xxx,FIREBASE_PROJECT_ID=xxx"
```

### Frontend: Firebase Hosting

```bash
cd frontend
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

**Cost Estimate with $300 credits:**
- Cloud Run: ~$5-20/month for light usage
- Firebase Hosting: Free
- Total: $300 lasts 3-6 months easily

---

## Files to Create Before Deployment

1. `backend/Procfile` - Deployment start command
2. `backend/runtime.txt` - Python version (optional)
3. Update `backend/app/main.py` - CORS origins
4. Update `frontend/next.config.js` - Standalone output

---

## Quick Deployment Checklist

- [ ] Push latest code to GitHub (when ready)
- [ ] Create Vercel account (no credit card)
- [ ] Create Render.com account (no credit card)
- [ ] Deploy backend to Render first
- [ ] Copy backend URL
- [ ] Deploy frontend to Vercel with backend URL
- [ ] Test login/registration flow
- [ ] Test AI features
