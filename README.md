# AI Travel Planner

AI-powered travel itinerary planner. Submit your trip preferences and get a full day-by-day plan with budget breakdown, weather forecast, and place descriptions — generated in seconds.

## Tech Stack

**Frontend** — React 18, Vite, Tailwind CSS v4 
**Backend** — FastAPI, Python 3.11 
**AI** — Google Gemini 2.0 Flash + Groq Llama 3.3 70B (auto-fallback) 
**Data sources** — Nominatim/OpenStreetMap, Wikipedia REST API, Open-Meteo 
**Deploy** — Vercel (frontend) + Render (backend)

## How It Works

When a user submits the trip form, the backend runs a 3-stage pipeline:

### Stage 1 — AI Itinerary Generation

The backend builds a structured prompt from the user's inputs:
origin, destination, number of days, budget (INR), interests, travel style, and transport preference.

A constrains the LLM to return **only valid JSON** matching a strict schema:
day-by-day activity plans, meal suggestions, an exact INR budget breakdown, packing list, and travel tips.

**Gemini 2.0 Flash** is tried first. If it hits a quota/rate-limit error, **Groq Llama 3.3 70B** is tried automatically as a fallback. If both providers are exhausted, the user gets a clear 429 error with a retry message.

### Stage 2 — Data Enrichment

The raw AI output is passed to an enrichment layer that fetches live data from three public APIs:

1. **Nominatim (OpenStreetMap)** — geocodes the destination city → lat/lon coordinates
2. **Open-Meteo** — uses those coordinates + trip dates → daily temperature, precipitation, and weather descriptions
3. **Wikipedia REST API** — extracts named places from the AI-generated activity list (filters out generic entries like "breakfast" or "sightseeing"), then fetches a summary paragraph and thumbnail image for each real place

Place name extraction is heuristic: it strips prefixes like "visit the", "explore", filters meal keywords and generic activity terms, then deduplicates before querying Wikipedia.

### Stage 3 — Response Assembly

All data is merged into a single `ItineraryResponse`:

```
destination, trip_summary ← from AI
days[] ← from AI (activities, meals, cost per day)
budget (flights, hotels, food...) ← from AI
packing_list[], tips[] ← from AI
destination_coords (lat, lon) ← from Nominatim
weather[] (temp, rain, emoji) ← from Open-Meteo
enriched_places[] (name, desc, img) ← from Wikipedia
```

The frontend renders everything in one view — no further API calls needed.

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:8000` in `.env` if needed.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/health | GET | Health check |
| /api/v1/autocomplete | GET | City autocomplete (Nominatim) |
| /api/v1/estimate | GET | Budget estimate for a destination |
| /api/v1/flights | GET | Indicative flight fares + Google Flights link |
| /api/v1/plan | POST | Generate full itinerary (AI + enrichment) |

## Features

- Sequential form flow with gated steps (destination → dates → duration → preferences → budget)
- Live destination autocomplete with keyboard nav
- Budget estimation per destination before submitting
- AI-generated day-by-day itinerary with INR cost breakdown
- Live weather forecast for trip dates
- Wikipedia-enriched place cards with images
- Dual AI provider with automatic fallback
- Responsive design with smooth page transitions

## Deployment

See [DEPLOY.md](./DEPLOY.md) for Vercel + Render setup instructions.
