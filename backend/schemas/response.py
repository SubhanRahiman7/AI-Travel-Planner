from pydantic import BaseModel


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


class ItineraryResponse(BaseModel):
	destination: str
	trip_summary: str
	days: list[DayPlan]
	budget: BudgetBreakdown
	packing_list: list[str]
	tips: list[str]
