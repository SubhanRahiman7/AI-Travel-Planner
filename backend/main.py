import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import itinerary, cities
from config import settings

load_dotenv()

app = FastAPI(title="AI Travel Planner", version="1.0.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(itinerary.router, prefix="/api/v1", tags=["itinerary"])
app.include_router(cities.router, prefix="/api/v1", tags=["cities"])


@app.get("/api/v1/health")
async def health():
	return {"status": "ok"}
