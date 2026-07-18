import httpx
from config import settings

NOMINATIM_BASE = "https://nominatim.openstreetmap.org"
OVERPASS_BASE = "https://overpass-api.de/api/interpreter"
WIKI_BASE = "https://en.wikipedia.org/api/rest_v1"
OPEN_METEO_BASE = "https://api.open-meteo.com/v1"

USER_AGENT = "AI-Travel-Planner/1.0 (https://github.com)"


async def fetch_json(client, url, params=None):
	try:
		resp = await client.get(url, params=params, timeout=15)
		resp.raise_for_status()
		return resp.json()
	except Exception as e:
		print(f"[enrichment] {url}: {e}")
		return None


async def geocode(client, place_name):
	data = await fetch_json(client, f"{NOMINATIM_BASE}/search", {
		"q": place_name,
		"format": "json",
		"limit": 1,
	})
	if data and len(data) > 0:
		return {
			"lat": float(data[0]["lat"]),
			"lon": float(data[0]["lon"]),
			"display_name": data[0]["display_name"],
		}
	return None


async def get_nearby_places(client, lat, lon, place_type="tourism", radius=2000):
	query = f"""
[out:json];
(node["{place_type}"](around:{radius},{lat},{lon});
 way["{place_type}"](around:{radius},{lat},{lon});
);
out body 5;
"""
	data = await fetch_json(client, OVERPASS_BASE, {"data": query})
	if not data:
		return []
	places = []
	for el in data.get("elements", [])[:5]:
		tags = el.get("tags", {})
		places.append({
			"name": tags.get("name", "Unknown"),
			"type": place_type,
			"lat": el.get("lat"),
			"lon": el.get("lon"),
		})
	return places


async def get_wiki_summary(client, place_name):
	data = await fetch_json(client, f"{WIKI_BASE}/page/summary/{place_name}")
	if data and "extract" in data:
		return {
			"description": data["extract"],
			"image": data.get("thumbnail", {}).get("source"),
			"url": data.get("content_urls", {}).get("desktop", {}).get("page"),
		}
	return None


async def get_weather(client, lat, lon, start_date, end_date):
	params = {
		"latitude": lat,
		"longitude": lon,
		"daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode",
		"timezone": "auto",
		"start_date": start_date,
		"end_date": end_date,
	}
	data = await fetch_json(client, f"{OPEN_METEO_BASE}/forecast", params)
	if not data or "daily" not in data:
		return []
	daily = data["daily"]
	return [
		{
			"date": daily["time"][i],
			"temp_max": daily["temperature_2m_max"][i],
			"temp_min": daily["temperature_2m_min"][i],
			"precip_mm": daily["precipitation_sum"][i],
			"weathercode": daily["weathercode"][i],
		}
		for i in range(len(daily["time"]))
	]


WEATHER_CODES = {
	0: "☀️ Clear",
	1: "🌤 Mostly clear",
	2: "⛅ Partly cloudy",
	3: "☁️ Overcast",
	45: "🌫️ Foggy",
	48: "🌫️ Icy fog",
	51: "🌦 Light drizzle",
	55: "🌦 Drizzle",
	61: "🌧 Light rain",
	63: "🌧 Rain",
	65: "🌧 Heavy rain",
	71: "🌨 Light snow",
	73: "🌨 Snow",
	80: "🌦 Rain showers",
	95: "⛈ Thunderstorm",
}


def describe_weather(code: int) -> str:
	return WEATHER_CODES.get(code, "🌡 Variable")


async def enrich_itinerary(itinerary: dict, start_date: str = None) -> dict:
	async with httpx.AsyncClient(headers={"User-Agent": USER_AGENT, "Accept": "application/json"}) as client:
		destination = itinerary.get("destination", "")
		geo = await geocode(client, destination)

		if not geo:
			itinerary["destination_coords"] = None
			itinerary["weather"] = []
			itinerary["enriched_places"] = []
			return itinerary

		itinerary["destination_coords"] = {
			"lat": geo["lat"],
			"lon": geo["lon"],
			"display_name": geo["display_name"],
		}

		if start_date:
			from datetime import datetime, timedelta
			try:
				start = datetime.strptime(start_date, "%Y-%m-%d")
				end = start + timedelta(days=len(itinerary.get("days", [])) - 1)
				end_str = end.strftime("%Y-%m-%d")
			except Exception:
				end_str = start_date
			forecast = await get_weather(client, geo["lat"], geo["lon"], start_date, end_str)
			itinerary["weather"] = [
				{
					**d,
					"description": describe_weather(d["weathercode"]),
				}
				for d in forecast
			]
		else:
			itinerary["weather"] = []

		place_names = []
		seen = set()
		generic = {"surfing", "parasailing", "skydiving", "trekking", "hiking",
			"swimming", "snorkeling", "diving", "boating", "sailing",
			"local street food", "street food", "local market", "the local market",
			"shopping", "cooking class", "local cuisine", "breakfast", "lunch", "dinner", "spa",
			"massage", "yoga", "meditation", "photography", "sightseeing",
			"water sports", "beach", "market", "bus tour"}
		meal_kw = ("breakfast", "lunch", "dinner", "meal", "café", "cafe",
			"restaurant", "food at", "eat ", "snack")
		for day in itinerary.get("days", []):
			for act in day.get("activities", []):
				name = act.split("(")[0].split(" - ")[0].strip()
				if any(kw in name.lower() for kw in meal_kw):
					continue
				prefixes = ("visit the ", "visit ", "explore the ", "explore ", "the ",
					"walk in ", "walk ", "see ", "tour ", "experience ", "enjoy ",
					"discover ", "try ", "check out ", "go to ", "head to ",
					"stop at ", "stop by ", "explore a ", "take a ", "take the ",
					"have a ")
				for pfx in prefixes:
					if name.lower().startswith(pfx):
						name = name[len(pfx):].strip()
						break
				if " at " in name.lower() or " in " in name.lower() or " by " in name.lower():
					continue
				if not name or len(name) < 4:
					continue
				if name.lower() in generic:
					continue
				if name.lower() in seen:
					continue
				seen.add(name.lower())
				place_names.append(name)
				if len(place_names) >= 6:
					break
			if len(place_names) >= 6:
				break

		enriched = []
		for name in place_names[:6]:
			place_geo = await geocode(client, f"{name}, {destination}")
			wiki = await get_wiki_summary(client, name.replace(" ", "_").replace(",", ""))
			if not place_geo and not wiki:
				continue
			entry = {"name": name}
			if place_geo:
				entry["lat"] = place_geo["lat"]
				entry["lon"] = place_geo["lon"]
			if wiki:
				entry["description"] = wiki["description"]
				entry["image"] = wiki["image"]
				entry["url"] = wiki["url"]
			enriched.append(entry)

		itinerary["enriched_places"] = enriched
		return itinerary
