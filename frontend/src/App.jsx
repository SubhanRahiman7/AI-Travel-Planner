import { useState } from "react";
import { generateItinerary } from "./api";
import Loader from "./components/Loader";
import Results from "./components/Results";

export default function App() {
 const [loading, setLoading] = useState(false);
 const [result, setResult] = useState(null);
 const [error, setError] = useState("");

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);
 setError("");
 setResult(null);
 try {
 const data = await generateItinerary({
 destination: e.target.destination.value.trim(),
 start_date: e.target.start_date.value || undefined,
 days: parseInt(e.target.days.value),
 budget_inr: parseFloat(e.target.budget.value),
 interests: e.target.interests.value
 .split(",")
 .map((s) => s.trim())
 .filter(Boolean),
 travel_style: e.target.travel_style.value,
 transport_pref: e.target.transport.value,
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
 <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
 <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "var(--color-lime)", color: "var(--color-ink)", padding: "6px 12px", borderRadius: 20, border: "1.5px solid var(--color-ink)", whiteSpace: "nowrap" }}>AI-powered</span>
 </div>
 </div>
 </header>

 <main style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
 {error && (
 <div className="anim-fade-up" style={{ margin: "24px 0", padding: "16px 20px", background: "#FEE2E2", border: "2px solid #EF4444", borderRadius: 14, color: "#DC2626", fontWeight: 600, fontSize: 14 }}>
 <span style={{ fontWeight: 700 }}>Error:</span> {error}
 </div>
 )}

 {result && !loading && <Results data={result} onNewSearch={() => setResult(null)} />}

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
 <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Destination</label>
 <input name="destination" required placeholder="Try 'Lisbon' or 'Kyoto'"
 style={{ width: "100%", background: "#FFFFFF", border: "2px solid var(--color-ink)", borderRadius: 14, padding: "16px 18px", fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600, color: "var(--color-ink)", marginBottom: 20, outline: "none" }} />

 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
 <div>
 <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Start Date</label>
 <input name="start_date" type="date"
 style={{ width: "100%", background: "#FFFFFF", border: "2px solid var(--color-ink)", borderRadius: 12, padding: "12px 14px", fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 600, color: "var(--color-ink)", outline: "none" }} />
 <p style={{ fontSize: 11, color: "var(--color-ink-muted)", marginTop: 6, fontWeight: 500 }}>For accurate weather forecast</p>
 </div>
 <div>
 <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Duration</label>
 <div style={{ display: "flex", gap: 6 }} role="group" aria-label="Duration in days">
 {[3, 5, 7, 10].map((d) => (
 <button key={d} type="button" name="days-btn" data-value={d} onClick={(e) => { const val = parseInt(e.currentTarget.dataset.value); e.currentTarget.form.querySelector('[name=days]').value = val; }}
 style={{ flex: 1, padding: "12px 0", border: "2px solid var(--color-ink)", borderRadius: 9, fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: d === 5 ? 700 : 600, color: d === 5 ? "var(--color-cream)" : "var(--color-ink-muted)", background: d === 5 ? "var(--color-ink)" : "var(--color-cream)", cursor: "pointer", transition: "all 0.15s" }}>
 {d}d
 </button>
 ))}
 </div>
 <input name="days" type="hidden" defaultValue={5} />
 </div>
 </div>

 <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Budget (₹)</label>
 <input name="budget" type="range" min="20000" max="500000" step="5000" defaultValue="120000" id="budget-range"
 style={{ width: "100%", accentColor: "var(--color-rose)", marginBottom: 6 }} />
 <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--color-ink-muted)", marginBottom: 22 }}>
 <span>₹20,000</span>
 <span id="budget-display" style={{ color: "var(--color-ink)", fontWeight: 800, fontSize: 16, fontFamily: "var(--font-heading)" }}>₹1,20,000</span>
 <span>₹5,00,000</span>
 </div>

 <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Interests</label>
 <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }} role="group" aria-label="Interests">
 {["Culture", "Food", "Nature", "Nightlife", "Adventure", "Relaxation", "Shopping", "History"].map((tag) => (
 <InterestChip key={tag} tag={tag} />
 ))}
 </div>

 <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Travel Style</label>
 <div className="pill-group" style={{ marginBottom: 20 }} role="radiogroup" aria-label="Travel style">
 {["Budget", "Balanced", "Luxury"].map((s) => <StylePill key={s} label={s} defaultActive={s === "Balanced"} />)}
 </div>

 <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Transport</label>
 <div className="pill-group" style={{ marginBottom: 28 }} role="radiogroup" aria-label="Transport">
 {["Public", "Private", "Mixed"].map((t) => <TransportPill key={t} label={t} defaultActive={t === "Public"} />)}
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

function InterestChip({ tag }) {
 const [on, setOn] = useState(false);
 return (
 <button type="button" onClick={() => setOn(!on)} name="interests"
 value={tag}
 style={{ padding: "9px 18px", borderRadius: 20, fontSize: 13, fontWeight: on ? 700 : 600, cursor: "pointer", transition: "all 0.15s", border: on ? "1.5px solid var(--color-ink)" : "1.5px solid rgba(20,23,31,0.16)", color: on ? "var(--color-cream)" : "var(--color-ink)", background: on ? "linear-gradient(120deg, var(--color-coral), var(--color-rose))" : "var(--color-cream)", boxShadow: on ? "0 4px 12px rgba(255,46,126,0.35)" : "none", transform: on ? "translateY(-1px)" : "none" }}>
 {tag}
 </button>
 );
}

function StylePill({ label, defaultActive }) {
 const [active, setActive] = useState(defaultActive);
 return (
 <button type="button" name="travel_style" value={label.toLowerCase()} onClick={() => setActive(true)}
 style={{ flex: 1, padding: "11px 0", border: "none", borderRadius: 9, fontSize: 14, fontWeight: active ? 700 : 600, cursor: "pointer", transition: "all 0.15s", color: active ? "var(--color-cream)" : "var(--color-ink-muted)", background: active ? "var(--color-ink)" : "transparent", boxShadow: active ? "0 2px 6px rgba(20,23,31,0.3)" : "none" }}>
 {label}
 </button>
 );
}

function TransportPill({ label, defaultActive }) {
 const [active, setActive] = useState(defaultActive);
 return (
 <button type="button" name="transport" value={label.toLowerCase()} onClick={() => setActive(true)}
 style={{ flex: 1, padding: "11px 0", border: "none", borderRadius: 9, fontSize: 14, fontWeight: active ? 700 : 600, cursor: "pointer", transition: "all 0.15s", color: active ? "var(--color-cream)" : "var(--color-ink-muted)", background: active ? "var(--color-ink)" : "transparent", boxShadow: active ? "0 2px 6px rgba(20,23,31,0.3)" : "none" }}>
 {label}
 </button>
 );
}
