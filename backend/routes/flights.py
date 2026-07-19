import logging
import math
import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()
NOMINATIM_BASE = "https://nominatim.openstreetmap.org"
USER_AGENT = "AI-Travel-Planner/1.0 (https://github.com/SubhanRahiman7/AI-Travel-Planner)"


def haversine_km(lat1, lon1, lat2, lon2):
	"""Great-circle distance in km."""
	r = 6371
	phi1, phi2 = math.radians(lat1), math.radians(lat2)
	dphi = math.radians(lat2 - lat1)
	dlambda = math.radians(lon2 - lon1)
	a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
	return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def estimate_fares(distance_km, same_country):
	"""Return indicative fare estimates in INR with airline-like booking links."""
	if same_country:
		base_eco = max(1500, distance_km * 4.0)
		base_bus = max(4000, distance_km * 12.0)
		base_fir = max(8000, distance_km * 22.0)
		airlines = ["IndiGo", "Air India", "Vistara", "SpiceJet"]
	else:
		base_eco = max(3000, distance_km * 1.8)
		base_bus = max(10000, distance_km * 5.5)
		base_fir = max(25000, distance_km * 12.0)
		airlines = ["Emirates", "Qatar Airways", "Singapore Air", "Air India"]

	def make(label, base, pct_low, pct_high, cls):
		low = int(base * pct_low)
		high = int(base * pct_high)
		return {
			"class": cls,
			"label": label,
			"price_inr_low": low,
			"price_inr_high": high,
			"price_inr_mid": int((low + high) / 2),
			"airline": airlines[0] if cls == "economy" else airlines[1] if cls == "business" else airlines[2],
		}

	return [
		make("Economy", base_eco, 0.80, 1.30, "economy"),
		make("Business", base_bus, 0.85, 1.25, "business"),
		make("First Class", base_fir, 0.90, 1.20, "first"),
	]
async def _geocode(client, q):
	resp = await client.get(
		f"{NOMINATIM_BASE}/search",
		params={"q": q, "format": "json", "limit": 1, "addressdetails": 1, "accept-language": "en"},
		)
	if resp.status_code == 429:
		raise HTTPException(429, "Too many requests. Please try again in a moment.")
	resp.raise_for_status()
	data = resp.json()
	if not data:
		raise HTTPException(404, f"Could not find '{q}'")
	geo = data[0]
	return {
		"name": geo.get("display_name", "").split(",")[0].strip(),
		"lat": float(geo["lat"]),
		"lon": float(geo["lon"]),
		"country_code": geo.get("address", {}).get("country_code", "").upper(),
	}



@router.get("/flights")
async def get_flights(origin: str = Query(...), destination: str = Query(...), date: str = Query(...)):
	"""Return indicative flight fare estimates + Google Flights deep link."""
	if not origin or not destination or not date:
		raise HTTPException(400, "origin, destination and date are required")

	date_iso = date.replace("-", "")
	date_compact = f"{date_iso[:4]}-{date_iso[4:6]}-{date_iso[6:8]}"
	search_url = (
		f"https://www.google.com/travel/flights?"
		f"q=Flights%20from%20{origin.upper()}%20to%20{destination.upper()}%20on%20{date_compact}"
	)

	try:
		async with httpx.AsyncClient(
			headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
			timeout=10,
		) as client:
			orig_geo = await _geocode(client, origin)
			dest_geo = await _geocode(client, destination)
	except HTTPException:
		raise
	except Exception as e:
		logging.getLogger(__name__).error("Flight geocode failed: %s", e)
		return {
			"origin": origin.upper(),
			"destination": destination.upper(),
			"date": date_compact,
			"search_url": search_url,
			"source": "deep_link",
			"warning": "Could not fetch live prices. Use the link below for real fares.",
		}

	same_country = orig_geo["country_code"] == dest_geo["country_code"]
	distance_km = round(haversine_km(orig_geo["lat"], orig_geo["lon"], dest_geo["lat"], dest_geo["lon"]))
	fare_type = "Domestic" if same_country else "International"
	fare_options = estimate_fares(distance_km, same_country)

	return {
		"origin": orig_geo["name"].upper(),
		"destination": dest_geo["name"].upper(),
		"date": date_compact,
		"distance_km": distance_km,
		"fare_type": fare_type,
		"fare_options": fare_options,
		"search_url": search_url,
		"source": "estimated",
		"warning": "Prices are indicative estimates for reference only - actual fares vary by date, airline, and booking time.",
	}

