import json
import time
import asyncio

from groq import Groq, RateLimitError
from config import settings
from google import genai


SYSTEM_PROMPT = """Output ONLY valid JSON matching this schema:
{
 "destination": "string",
 "trip_summary": "string (2-3 sentences)",
 "days": [
 { "day": 1, "title": "string", "activities": ["..."], "meals": ["..."], "estimated_cost_inr": 0 }
 ],
 "budget": { "flights": 0, "hotels": 0, "food": 0, "transport": 0, "activities": 0, "total": 0 },
 "packing_list": ["..."],
 "tips": ["..."]
}
All costs in INR. Budget total must equal user budget exactly. Be destination-specific."""


class AIService:
	QUOTA_ERROR_MSGS = [
		"rate_limit",
		"rate limit",
		"quota",
		"too many requests",
		"429",
		"resource_exhausted",
		"billing",
		"billing details",
		"free tier",
		"limit reached",
		"exceeded",
	]

	def __init__(self):
		self.groq_client = None
		groq_key = settings.groq_api_key
		if groq_key:
			self.groq_client = Groq(api_key=groq_key, timeout=60)

		self.gemini_client = None
		try:
			gemini_key = settings.gemini_api_key
			if gemini_key:
				self.gemini_client = genai.Client(api_key=gemini_key)
		except Exception:
			pass

	def _is_quota_error(self, err: Exception) -> bool:
		msg = str(err).lower()
		return any(kw in msg for kw in self.QUOTA_ERROR_MSGS)

	def _parse(self, text: str) -> dict:
		text = text.strip()
		if text.startswith("```"):
			parts = text.split("```")
			text = parts[1] if len(parts) > 1 else text
			text = text.strip()
			if text.startswith("json"):
				text = text[4:].strip()
		return json.loads(text)

	def generate_itinerary(self, req) -> dict:
		prompt = f"""{SYSTEM_PROMPT}

Destination: {req.destination}
Days: {req.days}
Budget: INR {req.budget_inr:,.0f}
Interests: {', '.join(req.interests) or 'general sightseeing'}
Travel style: {req.travel_style}
Transport: {req.transport_pref}"""

		last_err = None
		providers = []
		if self.gemini_client:
			providers.append(("Gemini", self._try_gemini))
		if self.groq_client:
			providers.append(("Groq", self._try_groq))

		for name, fn in providers:
			try:
				result = fn(prompt)
				if result.get("_quota_error"):
					last_err = result
					continue
				return result
			except Exception as e:
				if self._is_quota_error(e):
					last_err = e
					continue
				raise

		# All providers failed
		quota_err = last_err if last_err else Exception("AI service unavailable")
		raise _QuotaLimitError(quota_err)


	def _try_gemini(self, prompt: str) -> dict:
		try:
			response = self.gemini_client.models.generate_content(
				model="gemini-2.0-flash",
				contents=prompt,
				config={"temperature": 0.7, "max_output_tokens": 4096},
			)
			return self._parse(response.text)
		except Exception as e:
			if self._is_quota_error(e):
				return {"_quota_error": True}
			raise

	def _try_groq(self, prompt: str) -> dict:
		response = self.groq_client.chat.completions.create(
			model="llama-3.3-70b-versatile",
			messages=[{"role": "user", "content": prompt}],
			temperature=0.7,
			max_tokens=4096,
		)
		return self._parse(response.choices[0].message.content)


class _QuotaLimitError(Exception):
	"""Raised when all AI providers hit their rate/quota limit."""
	pass
