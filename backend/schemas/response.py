from pydantic import BaseModel


class EnrichedPlace(BaseModel):
	name: str
	lat: float | None = None
	lon: float | None = None
	description: str | None = None
	image: str | None = None
	url: str | None = None


class DestinationCoords(BaseModel):
	lat: float
	lon: float
	display_name: str


class DayPlan(BaseModel):
	day: int
	title: str
	activities: list[str]
	meals: list[str]
	estimated_cost_inr: float


class BudgetBreakdown(BaseModel):
	flights: float
	hotels: float
	food: float
	transport: float
	activities: float
	total: float


class WeatherDay(BaseModel):
	date: str
	temp_max: float
	temp_min: float
	precip_mm: float
	weathercode: int
	description: str


class ItineraryResponse(BaseModel):
	destination: str
	trip_summary: str
	days: list[DayPlan]
	budget: BudgetBreakdown
	packing_list: list[str]
	tips: list[str]
	destination_coords: DestinationCoords | None = None
	weather: list[WeatherDay] = []
	enriched_places: list[EnrichedPlace] = []
