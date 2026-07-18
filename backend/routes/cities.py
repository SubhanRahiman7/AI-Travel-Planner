import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()
NOMINATIM_BASE = "https://nominatim.openstreetmap.org"
USER_AGENT = "AI-Travel-Planner/1.0 (https://github.com/SubhanRahiman7/AI-Travel-Planner)"


@router.get("/autocomplete")
async def autocomplete(q: str = Query(..., min_length=2, description="Destination search query")):
	"""Suggest places matching the query. Returns up to 8 results."""
	if not q.strip():
		return []
	async with httpx.AsyncClient(
		headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
		timeout=8,
	) as client:
		resp = await client.get(
			f"{NOMINATIM_BASE}/search",
			params={
				"q": q,
				"format": "json",
				"limit": 8,
				"addressdetails": 1,
				"accept-language": "en",
			},
		)
		if resp.status_code == 429:
			raise HTTPException(429, "Too many search requests. Please try again in a moment.")
		resp.raise_for_status()
		data = resp.json()
	results = []
	for item in data:
		results.append({
			"name": item.get("display_name", "").split(",")[0].strip(),
			"display_name": item.get("display_name", ""),
			"lat": float(item["lat"]),
			"lon": float(item["lon"]),
			"type": item.get("type", ""),
			"country": item.get("address", {}).get("country", ""),
			"state": item.get("address", {}).get("state", item.get("address", {}).get("county", "")),
		})
	return results


@router.get("/estimate")
async def estimate_budget(destination: str = Query(..., min_length=2)):
	"""Estimate budget range for a destination. No AI call — fast and free."""
	async with httpx.AsyncClient(
		headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
		timeout=8,
	) as client:
		resp = await client.get(
			f"{NOMINATIM_BASE}/search",
			params={"q": destination, "format": "json", "limit": 1, "addressdetails": 1, "accept-language": "en"},
		)
		if resp.status_code == 429:
			raise HTTPException(429, "Too many requests. Please try again in a moment.")
		resp.raise_for_status()
		data = resp.json()
		if not data:
			raise HTTPException(404, f"Could not find '{destination}'. Please check spelling.")

	geo = data[0]
	country_code = geo.get("address", {}).get("country_code", "").upper()
	display_name = geo.get("display_name", "")

	# Cost-of-living tiers based on country + city name heuristics
	cheap_countries = {"IN", "VN", "TH", "ID", "PH", "PK", "BD", "LK", "NP", "MM", "KH", "NG", "KE", "TZ", "EG", "MA"}
	mid_countries = {"TR", "MX", "BR", "AR", "ZA", "PL", "HU", "PT", "GR", "HR", "RO", "BG", "CO", "PE", "EC"}
	expensive_countries = {"US", "GB", "CA", "AU", "JP", "KR", "SG", "HK", "FR", "DE", "IT", "ES", "NL", "SE", "NO", "CH", "DK", "FI", "IE", "AT", "BE"}

	name_lower = geo.get("display_name", "").lower()
	expensive_keywords = ["new york", "london", "tokyo", "paris", "sydney", "dubai", "singapore", "hong kong", "zurich", "geneva", "san francisco", "los angeles", "toronto", "vancouver", "amsterdam", "barcelona", "rome", "milan", "stockholm", "oslo", "copenhagen"]
	cheap_keywords = ["kathmandu", "hanoi", "phnom penh", "yangon", "colombo", "dhaka", "karachi", "lahore", "nairobi", "accra", "casablanca", "cairo", "kolkata", "goa"]

	# Determine tier
	if any(kw in name_lower for kw in expensive_keywords) or country_code in expensive_countries:
		tier = "expensive"
	elif any(kw in name_lower for kw in cheap_keywords) or country_code in cheap_countries:
		tier = "cheap"
	else:
		tier = "mid"

	ranges = {
		"cheap": {"min": 15000, "max": 80000, "default": 35000, "label": "Budget-friendly"},
		"mid": {"min": 30000, "max": 150000, "default": 70000, "label": "Moderate cost"},
		"expensive": {"min": 80000, "max": 500000, "default": 180000, "label": "Higher cost of living"},
	}
	r = ranges[tier]

	return {
		"destination": geo.get("display_name", "").split(",")[0].strip(),
		"country": geo.get("address", {}).get("country", ""),
		"tier_label": r["label"],
		"suggested_min_inr": r["min"],
		"suggested_max_inr": r["max"],
		"suggested_default_inr": r["default"],
		"lat": float(geo["lat"]),
		"lon": float(geo["lon"]),
	}
