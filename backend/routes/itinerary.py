from fastapi import APIRouter, HTTPException
from schemas.request import TripRequest
from schemas.response import ItineraryResponse
from services.ai_service import AIService

router = APIRouter()
ai = AIService()


@router.post("/plan", response_model=ItineraryResponse)
async def create_itinerary(req: TripRequest):
	try:
		data = ai.generate_itinerary(req)
		return ItineraryResponse(**data)
	except Exception as e:
		raise HTTPException(500, f"Failed to generate itinerary: {str(e)}")
