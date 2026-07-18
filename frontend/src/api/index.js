const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function generateItinerary(formData) {
 const res = await fetch(`${API_BASE}/api/v1/plan`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(formData),
 });
 if (!res.ok) {
 const err = await res.json();
 throw new Error(err.detail || "Failed to generate itinerary");
 }
 return res.json();
}

export function formatINR(value) {
 if (value == null || isNaN(value)) return "₹0";
 const abs = Math.abs(value);
 const formatted = abs.toLocaleString("en-IN");
 return `₹${value < 0 ? "-" : ""}${formatted}`;
}
