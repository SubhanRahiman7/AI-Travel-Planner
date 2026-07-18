const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function generateItinerary(formData) {
	const res = await fetch(`${API_BASE}/api/v1/plan`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(formData),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({ detail: "Failed to generate itinerary" }));
		const errMsg = new Error(err.detail || "Failed to generate itinerary");
		errMsg.status = res.status;
		throw errMsg;
	}
	return res.json();
}

export async function autocompleteDestination(q, signal) {
	if (!q || q.trim().length < 2) return [];
	try {
		const res = await fetch(
			`${API_BASE}/api/v1/autocomplete?q=${encodeURIComponent(q)}`,
			{ signal }
		);
		if (!res.ok) return [];
		return await res.json();
	} catch (e) {
		if (e.name === "AbortError") return [];
		return [];
	}
}

export async function estimateBudget(destination, signal) {
	const res = await fetch(
		`${API_BASE}/api/v1/estimate?destination=${encodeURIComponent(destination)}`,
		{ signal }
	);
	if (!res.ok) {
		const err = await res.json().catch(() => ({ detail: "Estimation failed" }));
		throw new Error(err.detail || "Could not estimate budget for this destination");
	}
	return res.json();
}

export function formatINR(value) {
	if (value == null || isNaN(value)) return "₹0";
	const abs = Math.abs(value);
	const formatted = abs.toLocaleString("en-IN");
	return `₹${value < 0 ? "-" : ""}${formatted}`;
}
