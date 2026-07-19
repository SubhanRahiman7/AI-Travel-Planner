import { useState } from "react";
import { formatINR } from "../api";
import MapView from "./MapView";

const dayIcon = (dayNum) => {
 const icons = ["🌅", "🏛️", "🏔️", "🍜", "🌃", "🎨", "🏖️"];
 return icons[(dayNum - 1) % icons.length];
};

export default function Results({ data, onNewSearch }) {
 const {
 destination,
 trip_summary,
 days,
 budget,
 packing_list,
 tips,
 destination_coords,
 weather = [],
 enriched_places = [],
 } = data;

 const totalSpent = budget.flights + budget.hotels + budget.food + budget.transport + budget.activities;
 const budgetRemaining = budget.total - totalSpent;
 const withinBudget = budgetRemaining >= 0;

 const budgetItems = [
 { label: "Flights", value: budget.flights, color: "var(--color-coral)", icon: "✈️" },
 { label: "Hotels", value: budget.hotels, color: "var(--color-rose)", icon: "🏨" },
 { label: "Food", value: budget.food, color: "var(--color-purple)", icon: "🍽️" },
 { label: "Transport", value: budget.transport, color: "var(--color-teal)", icon: "🚗" },
 { label: "Activities", value: budget.activities, color: "var(--color-amber)", icon: "🎟️" },
 ];
 const maxVal = Math.max(...budgetItems.map((b) => b.value));
 const budgetSegments = budgetItems.map((seg) => ({
 ...seg,
 pct: (seg.value / budget.total) * 100,
 }));

 const sectionLabel = (label) => (
 <div style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: "var(--color-ink)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
 {label}
 </div>
 );

 return (
 <div className="anim-fade-up" style={{ padding: "40px 0 80px", maxWidth: 1100, margin: "0 auto", paddingLeft: 24, paddingRight: 24, display: "flex", flexDirection: "column", gap: 32 }}>
 <button onClick={onNewSearch} style={{ background: "var(--color-cream)", border: "2px solid var(--color-ink)", color: "var(--color-ink)", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", alignSelf: "flex-start" }}
 onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-lime)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
 onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-cream)"; e.currentTarget.style.transform = "translateY(0)"; }}>
 ← New search
 </button>

 {/* Trip header */}
 <div style={{ background: "linear-gradient(120deg, var(--color-coral), var(--color-rose) 60%, var(--color-purple))", borderRadius: 24, padding: 36, border: "2px solid var(--color-ink)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
 <div style={{ maxWidth: 640 }}>
 <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 700, color: "var(--color-cream)", margin: "0 0 10px", letterSpacing: "-0.01em" }}>
 {destination} ✨
 </h2>
 <p style={{ color: "rgba(251,246,236,0.9)", fontSize: 15, lineHeight: 1.6, margin: "0 0 14px" }}>{trip_summary}</p>
 {destination_coords && (
 <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(251,246,236,0.85)", display: "flex", alignItems: "center", gap: 6 }}>
 <span>📍</span> {destination_coords.display_name}
 </p>
 )}
 </div>
 <div style={{ textAlign: "right", flexShrink: 0, background: "rgba(20,23,31,0.25)", borderRadius: 14, padding: "14px 18px", border: "1px solid rgba(251,246,236,0.15)" }}>
 <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(251,246,236,0.75)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Total Budget</div>
 <div style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, color: "var(--color-cream)" }}>{formatINR(budget.total)}</div>
 </div>
 </div>

 {/* Weather + Map */}
 {(weather.length > 0 || destination_coords) && (
 <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }} data-mobile-stack="true">
 {weather.length > 0 && (
 <div className="card" style={{ padding: 22 }}>
 {sectionLabel("🌤️ 3-Day Forecast")}
 <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
 {weather.slice(0, 3).map((w, i) => {
 const date = new Date(w.date + "T00:00:00");
 const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
 const dayNum = date.getDate();
 return (
 <div key={i} style={{ background: "var(--color-cream-dark)", border: "2px solid var(--color-ink)", borderRadius: 14, padding: 14, textAlign: "center" }}>
 <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink-muted)", marginBottom: 8 }}>{dayName} {dayNum}</div>
 <div style={{ fontSize: 30, marginBottom: 8 }}>{w.description?.split(" ")[0] || "☀️"}</div>
 <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, color: "var(--color-ink)", fontWeight: 700 }}>
 {Math.round(w.temp_max)}° <span style={{ color: "var(--color-ink-muted)", fontWeight: 500 }}>/ {Math.round(w.temp_min)}°</span>
 </div>
 {w.precip_mm > 0 && (
 <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-purple)", marginTop: 6 }}>💧 {w.precip_mm}mm</div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 )}
 {destination_coords && (
 <div>
 {sectionLabel("🗺️ Destination Map")}
 <div className="card" style={{ overflow: "hidden", minHeight: 220 }}>
 <MapView coords={destination_coords} places={enriched_places} />
 </div>
 </div>
 )}
 </div>
 )}

 {/* Must-visit places */}
 {enriched_places.length > 0 && (
 <div>
 {sectionLabel("📍 Must-Visit Places")}
 <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8, scrollSnapType: "x mandatory" }}>
 {enriched_places.map((p, i) => (
 <div key={i} style={{ flex: "0 0 240px", background: "var(--color-cream)", border: "2px solid var(--color-ink)", borderRadius: 16, overflow: "hidden", scrollSnapAlign: "start", transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s" }}
 onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-rose)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 14px 30px -12px rgba(20,23,31,0.25)"; }}
 onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-ink)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
 {p.image && (
 <div style={{ position: "relative", height: 150, overflow: "hidden" }}>
 <img src={p.image} alt={p.name} loading="lazy"
 style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
 onError={(e) => { e.target.style.display = "none"; }}
 onMouseEnter={(e) => { e.target.style.transform = "scale(1.06)"; }}
 onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }} />
 <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,23,31,0.85), transparent 60%)", pointerEvents: "none" }} />
 </div>
 )}
 <div style={{ padding: 14 }}>
 <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: "var(--color-ink)", marginBottom: 6 }}>{p.name}</div>
 {p.description && (
 <p style={{ fontSize: 13, color: "var(--color-ink-muted)", lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>
 )}
 {p.url && (
 <a href={p.url} target="_blank" rel="noopener noreferrer"
 style={{ fontSize: 13, fontWeight: 700, color: "var(--color-rose)" }}>
 Read more →
 </a>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Budget breakdown */}
 <div className="card" style={{ padding: 24 }}>
 {sectionLabel("💰 Budget Breakdown")}
 <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden", background: "var(--color-cream-dark)", border: "1.5px solid rgba(20,23,31,0.12)" }}>
 {budgetSegments.map((seg, i) => (
 <div key={i} title={`${seg.label}: ${formatINR(seg.value)}`} style={{ width: `${seg.pct}%`, background: seg.color, animation: "barGrow 0.7s ease-out both", animationDelay: `${i * 100}ms`, transition: "width 0.6s ease-out" }} />
 ))}
 </div>
 <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16 }}>
 {budgetItems.map((item) => (
 <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--color-ink-muted)" }}>
 <span style={{ width: 10, height: 10, borderRadius: 3, background: item.color, display: "inline-block", flexShrink: 0 }} />
 {item.icon} {item.label} · {formatINR(item.value)}
 </div>
 ))}
 </div>
 <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: withinBudget ? "#1E8E5A" : "#DC2626" }}>
 {withinBudget ? "✓ Within budget — no overages projected" : `⚠ Over budget by ${formatINR(Math.abs(budgetRemaining))}`}
 </div>
 </div>

 {/* Day-by-day itinerary */}
 <div>
 {sectionLabel("📅 Day-by-Day Itinerary")}
 <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
 {days.map((day) => (
 <div key={day.day} style={{ display: "flex", gap: 18, animation: "fadeUp 0.4s ease-out both", animationDelay: `${(day.day - 1) * 80}ms` }}>
 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 4 }}>
 <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-lime)", border: "2px solid var(--color-ink)", color: "var(--color-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
 {day.day}
 </div>
 {day.day < days.length && (
 <div style={{ width: 2, flex: 1, background: "rgba(20,23,31,0.15)", margin: "4px 0" }} />
 )}
 </div>
 <div style={{ flex: 1, background: "var(--color-cream)", border: "2px solid var(--color-ink)", borderRadius: 16, padding: 20, marginBottom: 20, transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s" }}
 onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-rose)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 26px -14px rgba(20,23,31,0.2)"; }}
 onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-ink)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
 <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: "var(--color-ink)" }}>{day.title}</div>
 <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-ink)", background: "var(--color-lime)", border: "1.5px solid var(--color-ink)", borderRadius: 20, padding: "4px 12px", whiteSpace: "nowrap" }}>
 {formatINR(day.estimated_cost_inr)}
 </div>
 </div>
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} data-mobile-stack="true">
 <div>
 <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Activities</div>
 {day.activities.map((act, i) => (
 <div key={i} style={{ fontSize: 14, color: "var(--color-ink)", marginBottom: 6, lineHeight: 1.5 }}>▸ {act}</div>
 ))}
 </div>
 <div>
 <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Meals</div>
 {day.meals.map((meal, i) => (
 <div key={i} style={{ fontSize: 14, color: "var(--color-ink)", marginBottom: 6, lineHeight: 1.5 }}>• {meal}</div>
 ))}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Packing list */}
 <div className="card" style={{ padding: 24 }}>
 {sectionLabel("🎒 Packing List")}
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
 {packing_list.map((item, i) => (
 <PackingItem key={i} label={item} />
 ))}
 </div>
 </div>

 {/* Travel tips */}
 <div style={{ background: "var(--color-tips-bg)", border: "2px solid var(--color-ink)", borderRadius: 18, padding: 24 }}>
 {sectionLabel("💡 Travel Tips")}
 {tips.map((tip, i) => (
 <div key={i} style={{ fontSize: 14, color: "#4A3B1F", lineHeight: 1.6, marginBottom: 8 }}>▸ {tip}</div>
 ))}
 </div>

 <div style={{ textAlign: "center", color: "var(--color-ink-faint)", fontSize: 12, fontWeight: 600, marginTop: 8 }}>
 Generated by AI · Always verify details before traveling
 </div>
 </div>
 );
}

function PackingItem({ label }) {
 const [checked, setChecked] = useState(false);
 return (
 <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "6px 0" }}>
 <span onClick={(e) => { e.preventDefault(); setChecked(!checked); }} style={{ width: 20, height: 20, borderRadius: 6, border: "2px solid var(--color-ink)", background: checked ? "var(--color-lime)" : "var(--color-cream)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-ink)", fontSize: 13, fontWeight: 800, flexShrink: 0, transition: "all 0.2s", cursor: "pointer" }}>
 {checked ? "✓" : ""}
 </span>
 <span style={{ fontSize: 14, color: checked ? "var(--color-ink-faint)" : "var(--color-ink)", textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.7 : 1, transition: "all 0.3s" }}>{label}</span>
 </label>
 );
}
