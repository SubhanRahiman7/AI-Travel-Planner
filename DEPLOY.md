# Deployment Guide

Backend → Render. Frontend → Vercel.

## 1. Deploy Backend (Render)

1. Go to https://dashboard.render.com → **New** → **Blueprint**.
2. Connect repo: `SubhanRahiman7/AI-Travel-Planner`.
3. Render detects `render.yaml` and creates `ai-travel-planner-api` service.
4. After creation, open the service → **Environment** → add:
 - `GEMINI_API_KEY` — your Gemini API key
 - `GROQ_API_KEY` — your Groq API key
5. Wait for first deploy. Note the URL (e.g. `https://ai-travel-planner-api.onrender.com`).
6. Verify: `curl https://ai-travel-planner-api.onrender.com/api/v1/health` → `{"status":"ok"}`.

## 2. Deploy Frontend (Vercel)

1. Go to https://vercel.com → **Add New Project** → import `SubhanRahiman7/AI-Travel-Planner`.
2. **Root Directory**: set to `frontend`.
3. **Environment Variables**:
 - `VITE_API_URL` = `https://ai-travel-planner-api.onrender.com`
4. Deploy. Note the URL (e.g. `https://ai-travel-planner.vercel.app`).

## 3. Lock down CORS

In `backend/main.py`, replace `allow_origins=["*"]` with:

```python
allow_origins=["https://ai-travel-planner.vercel.app"]
```

(replace with your actual Vercel domain). Then redeploy backend.

## 4. Notes

- Render free tier sleeps after 15 min idle. First request takes ~30s to wake.
- Cold starts also hit Gemini/Groq APIs on each new request — expect 2–5s on first call.
- Backend is stateless — no DB needed.
- Frontend `vite.config.js` already reads `VITE_API_URL` at build time (via `import.meta.env`).