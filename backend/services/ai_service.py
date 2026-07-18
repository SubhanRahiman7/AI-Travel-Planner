from groq import Groq
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
		self.groq_client = None
		groq_key = settings.groq_api_key
		if groq_key:
			self.groq_client = Groq(api_key=groq_key)
		self.gemini_client = None
		try:
			from google import genai
			gemini_key = settings.gemini_api_key
			if gemini_key:
				self.gemini_client = genai.Client(api_key=gemini_key)
		except Exception:
			pass

	def generate_itinerary(self, req) -> dict:
		prompt = f"""{SYSTEM_PROMPT}

Destination: {req.destination}
Days: {req.days}
Budget: ₹{req.budget_inr:,.0f}
Interests: {', '.join(req.interests) or 'general sightseeing'}
Travel style: {req.travel_style}
Transport preference: {req.transport_pref}"""

		if self.gemini_client:
			try:
				response = self.gemini_client.models.generate_content(
					model="gemini-2.0-flash", contents=prompt
				)
				return self._parse(response.text)
			except Exception:
				pass

		if self.groq_client:
			response = self.groq_client.chat.completions.create(
				model="llama-3.3-70b-versatile",
				messages=[{"role": "user", "content": prompt}],
				temperature=0.7,
				max_tokens=8192,
			)
			return self._parse(response.choices[0].message.content)

		raise Exception("No AI provider available. Set GROQ_API_KEY or GEMINI_API_KEY in .env")

	def _parse(self, text: str) -> dict:
		text = text.strip()
		if text.startswith("```"):
			text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
		import json
		return json.loads(text)
