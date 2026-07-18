from pydantic import BaseModel, Field


class TripRequest(BaseModel):
	destination: str = Field(..., description="City or country to visit")
	days: int = Field(ge=1, le=30, description="Number of travel days")
	budget_inr: float = Field(ge=100, description="Total budget in Indian Rupees")
	interests: list[str] = Field(default_factory=list, description="e.g. hiking, food, history")
	travel_style: str = Field(default="balanced", description="budget | moderate | luxury | balanced")
	transport_pref: str = Field(default="public", description="public | private | mixed")
