# AI Travel Planner

AI-powered travel itinerary planner built with React + FastAPI.

## Tech Stack

**Frontend** — React 18, Vite, Tailwind CSS v4
**Backend** — FastAPI, Python 3.11
**AI** — Gemini (itinerary generation), Groq (fallback)
**Deploy** — Vercel (frontend) + Render (backend)

## Local Development

### Backend

cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend

cd frontend
npm install
npm run dev

Set `VITE_API_URL=http://localhost:8000` in `.env` if needed.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/health | GET | Health check |
| /api/v1/autocomplete | GET | City autocomplete |
| /api/v1/estimate | GET | Budget estimate |
| /api/v1/flights | GET | Flight fare estimates |
| /api/v1/plan | POST | Generate full itinerary |

## Features

- Sequential form flow with gated steps
- Live destination autocomplete
- Budget estimation per destination
- Weather forecast for trip dates
- Wikipedia-enriched place descriptions
- Groq AI fallback for itinerary generation
- Responsive design with smooth page transitions

## Deployment

See [DEPLOY.md](./DEPLOY.md) for Vercel + Render setup instructions.
