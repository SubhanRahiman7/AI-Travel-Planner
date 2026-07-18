from google import genai
from config import settings

SYSTEM_PROMPT = """You are an expert travel planner. Output ONLY valid JSON, no markdown fences, no extra text.
Use this schema exactly:
{
 "destination": "string",
 "trip_summary": "string (2-3 sentences)",
 "days": [
 {
 "day": 1,
 "title": "string",
 "activities": ["..."],
 "meals": ["..."],
 "estimated_cost_inr": 0
 }
 ],
 "budget": {
 "flights": 0,
 "hotels": 0,
 "food": 0,
 "transport": 0,
 "activities": 0,
 "total": 0
 },
 "packing_list": ["..."],
 "tips": ["..."]
}
All costs must be in INR. Budget total must equal user budget exactly. Be specific to destination."""


class AIService:
	def __init__(self):
		self.client = genai.Client(api_key=settings.gemini_api_key)

	def generate_itinerary(self, req) -> dict:
		prompt = f"""{SYSTEM_PROMPT}

Destination: {req.destination}
Days: {req.days}
Budget: ₹{req.budget_inr:,.0f}
Interests: {', '.join(req.interests) or 'general sightseeing'}
Travel style: {req.travel_style}
Transport preference: {req.transport_pref}"""
		response = self.client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
		text = response.text.strip()
		if text.startswith("```"):
			text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
		import json
		return json.loads(text)
