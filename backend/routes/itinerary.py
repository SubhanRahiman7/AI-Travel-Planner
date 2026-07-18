from fastapi import APIRouter, HTTPException
from schemas.request import TripRequest
from schemas.response import ItineraryResponse
from services.ai_service import AIService, _QuotaLimitError
from services.enrichment import enrich_itinerary

router = APIRouter()
ai = AIService()

QUOTA_ERROR_MSG = "Our AI planning service is temporarily at capacity. We hit the free-tier request limit — please try again in a few minutes. If the problem persists, contact the developer."


@router.post("/plan", response_model=ItineraryResponse)
async def create_itinerary(req: TripRequest):
	try:
		data = ai.generate_itinerary(req)
		data = await enrich_itinerary(data, start_date=req.start_date)
		return ItineraryResponse(**data)
	except HTTPException:
		raise
	except _QuotaLimitError:
		raise HTTPException(
			429,
			f"AI service temporarily at capacity. "
			f"Both Gemini and Groq free tiers are exhausted. "
			f"Please retry in 1-2 minutes. If this keeps happening, contact the developer.",
		)
	except Exception as e:
		raise HTTPException(500, f"Failed to generate itinerary: {str(e)}")
