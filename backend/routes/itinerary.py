from fastapi import APIRouter, HTTPException
from schemas.request import TripRequest
from schemas.response import ItineraryResponse
from services.ai_service import AIService
from services.enrichment import enrich_itinerary

router = APIRouter()
ai = AIService()


@router.post("/plan", response_model=ItineraryResponse)
async def create_itinerary(req: TripRequest):
	try:
		data = ai.generate_itinerary(req)
		data = await enrich_itinerary(data, start_date=req.start_date)
		return ItineraryResponse(**data)
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(500, f"Failed to generate itinerary: {str(e)}")
