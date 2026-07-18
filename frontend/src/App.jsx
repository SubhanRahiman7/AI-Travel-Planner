import { useState, useEffect, useRef } from "react";
import { generateItinerary } from "./api";
import Loader from "./components/Loader";
import Results from "./components/Results";

const INTEREST_OPTIONS = ["Culture", "Food", "Nature", "Nightlife", "Adventure", "Relaxation", "Shopping", "History"];
const DURATIONS = [3, 5, 7, 10];
const TRAVEL_STYLES = ["Budget", "Balanced", "Luxury"];
const TRANSPORT_OPTIONS = ["Public", "Private", "Mixed"];

const BUDGET_MIN_PER_STYLE = { Budget: 20000, Balanced: 50000, Luxury: 120000 };

export default function App() {
 const [loading, setLoading] = useState(false);
 const [result, setResult] = useState(null);
 const [error, setError] = useState("");

 const [destination, setDestination] = useState("");
 const [startDate, setStartDate] = useState("");
 const [duration, setDuration] = useState(5);
 const [budget, setBudget] = useState(120000);
 const [interests, setInterests] = useState([]);
 const [travelStyle, setTravelStyle] = useState("Balanced");
 const [transport, setTransport] = useState("Public");

 const [budgetWarning, setBudgetWarning] = useState("");
 const budgetRef = useRef(null);

 useEffect(() => {
 const el = budgetRef.current;
 if (!el) return;
 const handleInput = () => {
 const val = parseInt(el.value, 10);
 setBudget(val);
 updateBudgetWarning(val, travelStyle, duration);
 };
 el.addEventListener("input", handleInput);
 return () => el.removeEventListener("input", handleInput);
 }, [travelStyle, duration]);

 const updateBudgetWarning = (val, style, days) => {
 const minForStyle = BUDGET_MIN_PER_STYLE[style] || 50000;
 const perDayMin = minForStyle / 3;
 const needed = Math.round(perDayMin * days);
 if (val < needed) {
 setBudgetWarning(`⚠ ${style} trips typically need ~${formatShortINR(needed)} for ${days} days. Consider a lower style or higher budget.`);
 } else if (val > needed * 3) {
 setBudgetWarning(`✓ Great buffer — you have extra room for upgrades and savings.`);
 } else {
 setBudgetWarning(`✓ This budget fits well for a ${style.toLowerCase()} ${days}-day trip.`);
 }
 };

 const toggleInterest = (tag) => {
 setInterests((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);
 setError("");
 setResult(null);
 try {
 const data = await generateItinerary({
 destination: destination.trim(),
 start_date: startDate || undefined,
 days: duration,
 budget_inr: budget,
 interests,
 travel_style: travelStyle.toLowerCase(),
 transport_pref: transport.toLowerCase(),
 });
 setResult(data);
 } catch (err) {
 setError(err.message);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen" style={{ background: "var(--color-cream)" }}>
 {loading && <Loader />}

 <header style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--color-cream)", borderBottom: "2.5px solid var(--color-ink)" }}>
 <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px" }}>
 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
 <span style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, var(--color-coral), var(--color-rose))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transform: "rotate(-8deg)" }}>✈</span>
 <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 19, letterSpacing: "-0.01em", color: "var(--color-ink)" }}>ATP</span>
 </div>
 <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "var(--color-lime)", color: "var(--color-ink)", padding: "6px 12px", borderRadius: 20, border: "1.5px solid var(--color-ink)", whiteSpace: "nowrap" }}>AI-powered</span>
 </div>
 </header>

 <main style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
 {error && (
 <div className="anim-fade-up" style={{ margin: "24px 0", padding: "16px 20px", background: "#FEE2E2", border: "2px solid #EF4444", borderRadius: 14, color: "#DC2626", fontWeight: 600, fontSize: 14 }}>
 <span style={{ fontWeight: 700 }}>Error:</span> {error}
 </div>
 )}

 {result && !loading && <Results data={result} onNewSearch={() => { setResult(null); setBudgetWarning(""); }} />}

 {!result && !loading && (
 <section style={{ background: "var(--color-ink)", padding: "64px 24px 96px", position: "relative", overflow: "hidden" }}>
 <div style={{ position: "absolute", top: -120, right: -80, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, var(--color-rose) 0%, transparent 70%)", opacity: 0.35, animation: "blobDrift 9s ease-in-out infinite" }} />
 <div style={{ position: "absolute", bottom: -140, left: -100, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, var(--color-purple) 0%, transparent 70%)", opacity: 0.3, animation: "blobDrift 11s ease-in-out infinite reverse" }} />

 <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", textAlign: "center" }}>
 <div style={{ fontSize: 48, marginBottom: 18, display: "inline-block", animation: "floatPlane 3.5s ease-in-out infinite" }}>🧭</div>
 <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(32px, 5vw, 50px)", fontWeight: 700, color: "var(--color-cream)", letterSpacing: "-0.02em", margin: "0 0 14px", lineHeight: 1.1 }}>
 Tell us where.<br />
 <span style={{ background: "linear-gradient(120deg, var(--color-coral), var(--color-rose))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>We'll plan everything else.</span>
 </h1>
 <p style={{ fontSize: 16, color: "var(--color-ink-faint)", margin: "0 0 40px", lineHeight: 1.6 }}>
 A full itinerary — places, weather, budget, packing — built in seconds by AI.
 </p>

 <form onSubmit={handleSubmit} style={{ background: "var(--color-cream)", borderRadius: 24, padding: 28, textAlign: "left", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.5)", border: "2px solid var(--color-ink)" }}>

 {/* Destination */}
 <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Destination</label>
 <input name="destination" required placeholder="Try 'Lisbon' or 'Kyoto'" value={destination} onChange={(e) => setDestination(e.target.value)}
 style={{ width: "100%", boxSizing: "border-box", background: "#FFFFFF", border: "2px solid var(--color-ink)", borderRadius: 14, padding: "16px 18px", fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600, color: "var(--color-ink)", marginBottom: 20, outline: "none" }} />

 {/* Date + Duration row */}
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
 <div>
 <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Start Date</label>
 <div style={{ position: "relative" }}>
 <input name="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
 style={{
 width: "100%", boxSizing: "border-box", background: "#FFFFFF", border: "2px solid var(--color-ink)", borderRadius: 12,
 padding: "12px 40px 12px 14px", fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 600,
 color: "var(--color-ink)", outline: "none", cursor: "pointer",
 colorScheme: "light",
 }} />
 <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>📅</span>
 </div>
 <p style={{ fontSize: 11, color: "var(--color-ink-muted)", marginTop: 6, fontWeight: 500 }}>For accurate weather forecast</p>
 </div>
 <div>
 <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Duration</label>
 <div style={{ display: "flex", gap: 6 }} role="group" aria-label="Duration">
 {DURATIONS.map((d) => (
 <button key={d} type="button" onClick={() => setDuration(d)}
 style={{
 flex: 1, padding: "12px 0", border: "2px solid var(--color-ink)", borderRadius: 9,
 fontFamily: "var(--font-heading)", fontSize: 14,
 fontWeight: d === duration ? 700 : 600,
 color: d === duration ? "var(--color-cream)" : "var(--color-ink-muted)",
 background: d === duration ? "var(--color-ink)" : "var(--color-cream)",
 cursor: "pointer", transition: "all 0.15s",
 }}>
 {d}d
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Budget slider */}
 <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Budget (₹)</label>
 <input ref={budgetRef} name="budget" type="range" min="20000" max="500000" step="5000" defaultValue={budget}
 style={{ width: "100%", accentColor: "var(--color-rose)", marginBottom: 6 }} />
 <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--color-ink-muted)", marginBottom: 6 }}>
 <span>₹20,000</span>
 <span id="budget-display" style={{ color: "var(--color-ink)", fontWeight: 800, fontSize: 16, fontFamily: "var(--font-heading)" }}>{formatINR(budget)}</span>
 <span>₹5,00,000</span>
 </div>
 {budgetWarning && (
 <div style={{ fontSize: 12, fontWeight: 600, color: budgetWarning.startsWith("✓") ? "#1E8E5A" : "#B45309", marginBottom: 16, minHeight: 18, transition: "all 0.2s" }}>
 {budgetWarning}
 </div>
 )}

 {/* Interests */}
 <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Interests</label>
 <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }} role="group" aria-label="Interests">
 {INTEREST_OPTIONS.map((tag) => {
 const on = interests.includes(tag);
 return (
 <button key={tag} type="button" onClick={() => toggleInterest(tag)} name="interests" value={tag}
 style={{
 padding: "9px 18px", borderRadius: 20, fontSize: 13, cursor: "pointer", transition: "all 0.15s",
 border: on ? "1.5px solid var(--color-ink)" : "1.5px solid rgba(20,23,31,0.16)",
 color: on ? "var(--color-cream)" : "var(--color-ink)",
 background: on ? "linear-gradient(120deg, var(--color-coral), var(--color-rose))" : "var(--color-cream)",
 fontWeight: on ? 700 : 600,
 boxShadow: on ? "0 4px 12px rgba(255,46,126,0.35)" : "none",
 transform: on ? "translateY(-1px)" : "none",
 }}>
 {tag}
 </button>
 );
 })}
 </div>

 {/* Travel Style — single select */}
 <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Travel Style</label>
 <div className="pill-group" style={{ marginBottom: 20 }} role="radiogroup" aria-label="Travel style">
 {TRAVEL_STYLES.map((s) => (
 <button key={s} type="button" name="travel_style" value={s.toLowerCase()} onClick={() => setTravelStyle(s)}
 style={{
 flex: 1, padding: "11px 0", border: "none", borderRadius: 9, fontSize: 14, cursor: "pointer", transition: "all 0.15s",
 color: s === travelStyle ? "var(--color-cream)" : "var(--color-ink-muted)",
 background: s === travelStyle ? "var(--color-ink)" : "transparent",
 fontWeight: s === travelStyle ? 700 : 600,
 boxShadow: s === travelStyle ? "0 2px 6px rgba(20,23,31,0.3)" : "none",
 }}>
 {s}
 </button>
 ))}
 </div>

 {/* Transport — single select */}
 <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Transport</label>
 <div className="pill-group" style={{ marginBottom: 28 }} role="radiogroup" aria-label="Transport">
 {TRANSPORT_OPTIONS.map((t) => (
 <button key={t} type="button" name="transport" value={t.toLowerCase()} onClick={() => setTransport(t)}
 style={{
 flex: 1, padding: "11px 0", border: "none", borderRadius: 9, fontSize: 14, cursor: "pointer", transition: "all 0.15s",
 color: t === transport ? "var(--color-cream)" : "var(--color-ink-muted)",
 background: t === transport ? "var(--color-ink)" : "transparent",
 fontWeight: t === transport ? 700 : 600,
 boxShadow: t === transport ? "0 2px 6px rgba(20,23,31,0.3)" : "none",
 }}>
 {t}
 </button>
 ))}
 </div>

 <button type="submit" className="btn-primary" disabled={loading}>
 {loading ? "Planning your trip…" : "✨ Plan My Trip"}
 </button>
 </form>
 </div>
 </section>
 )}
 </main>

 <footer style={{ borderTop: "2px solid rgba(20,23,31,0.1)", padding: "20px 24px", textAlign: "center", color: "var(--color-ink-faint)", fontSize: 13, fontWeight: 600 }}>
 Built with AI · FastAPI + React
 </footer>
 </div>
 );
}

function formatINR(value) {
 if (value == null || isNaN(value)) return "₹0";
 const abs = Math.abs(value);
 const formatted = abs.toLocaleString("en-IN");
 return `₹${value < 0 ? "-" : ""}${formatted}`;
}

function formatShortINR(value) {
 if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
 if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
 return `₹${value}`;
}
