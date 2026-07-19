from pydantic import BaseModel, Field


class TripRequest(BaseModel):
	origin: str = Field(..., description="Departure city or airport")
	destination: str = Field(..., description="City or country to visit")
	days: int = Field(ge=1, le=30, description="Number of travel days")
	budget_inr: float = Field(ge=100, description="Total budget in Indian Rupees")
	interests: list[str] = Field(default_factory=list, description="e.g. hiking, food, history")
	travel_style: str = Field(default="balanced", description="budget | moderate | luxury | balanced")
	transport_pref: str = Field(default="public", description="public | private | mixed")
	start_date: str | None = Field(default=None, description="Trip start date YYYY-MM-DD for weather forecast")