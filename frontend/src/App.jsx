import { useState, useEffect, useRef, useCallback } from "react";
import { generateItinerary, autocompleteDestination, estimateBudget, getFlights, formatINR } from "./api";
import Loader from "./components/Loader";
import Results from "./components/Results";

const INTEREST_OPTIONS = ["Culture", "Food", "Nature", "Nightlife", "Adventure", "Relaxation", "Shopping", "History"];
const DURATIONS = [3, 5, 7, 10];
const TRAVEL_STYLES = ["Budget", "Balanced", "Luxury"];
const TRANSPORT_OPTIONS = ["Public", "Private", "Mixed"];

const BUDGET_MIN_PER_STYLE = { Budget: 20000, Balanced: 50000, Luxury: 120000 };

const STEPS = ["Generating plan", "Enriching places", "Getting weather", "Almost done"];
const TAGLINES = [
	"Mapping the best routes for you…",
	"Curating hidden gems and local favorites…",
	"Checking the skies for your travel dates…",
	"Putting the final touches on your trip…",
];

function isResultValid(data) {
	return data && data.destination && data.budget && Array.isArray(data.days);
}

export default function App() {
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState("");

	const [destination, setDestination] = useState("");
	const [origin, setOrigin] = useState("");
	const [startDate, setStartDate] = useState("");
	const [duration, setDuration] = useState(5);
	const [budget, setBudget] = useState(null);
	const [budgetMin, setBudgetMin] = useState(null);
	const [budgetMax, setBudgetMax] = useState(null);
	const [budgetTier, setBudgetTier] = useState("");
	const [interests, setInterests] = useState([]);
	const [travelStyle, setTravelStyle] = useState("Balanced");
	const [transport, setTransport] = useState("Public");

	const [budgetWarning, setBudgetWarning] = useState("");
	const [budgetEstimateLoaded, setBudgetEstimateLoaded] = useState(false);
	const [flightData, setFlightData] = useState(null);
	const [loadingFlights, setLoadingFlights] = useState(false);

	// Autocomplete - destination
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
	const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
	const destInputRef = useRef(null);
	const suggestionsRef = useRef(null);
	const abortRef = useRef(null);
	const skipDestFetchRef = useRef(false);
	const destFocusedRef = useRef(false);

	// Autocomplete - origin
	const [originSuggestions, setOriginSuggestions] = useState([]);
	const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
	const [activeOriginIdx, setActiveOriginIdx] = useState(-1);
	const [fetchingOrigin, setFetchingOrigin] = useState(false);
	const originInputRef = useRef(null);
	const originSuggestionsRef = useRef(null);
	const originAbortRef = useRef(null);
	const skipOriginFetchRef = useRef(false);
	const originFocusedRef = useRef(false);

	// Debounced autocomplete - destination
	useEffect(() => {
		if (skipDestFetchRef.current) {
			skipDestFetchRef.current = false;
			return;
		}
		if (abortRef.current) abortRef.current.abort();
		abortRef.current = new AbortController();
		const signal = abortRef.current.signal;
		const trimmed = destination.trim();

		if (trimmed.length < 2) {
			setSuggestions([]);
			if (!destFocusedRef.current) setShowSuggestions(false);
			setFetchingSuggestions(false);
			return;
		}

		const timer = setTimeout(async () => {
			setFetchingSuggestions(true);
			try {
				const results = await autocompleteDestination(trimmed, signal);
				if (!signal.aborted) {
					setSuggestions(results);
					if (destFocusedRef.current) setShowSuggestions(results.length > 0);
					setActiveSuggestionIdx(-1);
				}
			} finally {
				if (!signal.aborted) setFetchingSuggestions(false);
			}
		}, 200);

		return () => {
			clearTimeout(timer);
			abortRef.current?.abort();
		};
	}, [destination]);

	// Debounced autocomplete - origin
	useEffect(() => {
		if (skipOriginFetchRef.current) {
			skipOriginFetchRef.current = false;
			return;
		}
		if (originAbortRef.current) originAbortRef.current.abort();
		originAbortRef.current = new AbortController();
		const signal = originAbortRef.current.signal;
		const trimmed = origin.trim();

		if (trimmed.length < 2) {
			setOriginSuggestions([]);
			if (!originFocusedRef.current) setShowOriginSuggestions(false);
			setFetchingOrigin(false);
			return;
		}

		const timer = setTimeout(async () => {
			setFetchingOrigin(true);
			try {
				const results = await autocompleteDestination(trimmed, signal);
				if (!signal.aborted) {
					setOriginSuggestions(results);
					if (originFocusedRef.current) setShowOriginSuggestions(results.length > 0);
					setActiveOriginIdx(-1);
				}
			} finally {
				if (!signal.aborted) setFetchingOrigin(false);
			}
		}, 200);

		return () => {
			clearTimeout(timer);
			originAbortRef.current?.abort();
		};
	}, [origin]);

	const selectSuggestion = useCallback((item) => {
		skipDestFetchRef.current = true;
		setDestination(item.name);
		setShowSuggestions(false);
		setSuggestions([]);
		fetchEstimate.current(item.display_name);
	}, []);

	const selectOriginSuggestion = useCallback((item) => {
		skipOriginFetchRef.current = true;
		setOrigin(item.name);
		setShowOriginSuggestions(false);
		setOriginSuggestions([]);
	}, []);

	const fetchEstimate = useRef(null);
	fetchEstimate.current = async (dest) => {
		try {
			const est = await estimateBudget(dest);
			setBudgetMin(est.suggested_min_inr);
			setBudgetMax(est.suggested_max_inr);
			const defaultVal = est.suggested_default_inr;
			setBudget(defaultVal);
			
			setBudgetTier(est.tier_label);
			setBudgetEstimateLoaded(true);
			updateBudgetWarning.current(defaultVal, travelStyle, duration);
		} catch (e) {
			setBudgetEstimateLoaded(true);
		}
	};

	const updateBudgetWarning = useRef((val, style, days) => {
		const minForStyle = BUDGET_MIN_PER_STYLE[style] || 50000;
		const perDayMin = minForStyle / 3;
		const needed = Math.round(perDayMin * days);
		if (val < needed) {
			setBudgetWarning(`${style} trips typically need ~${formatShortINR(needed)} for ${days} days. Consider a lower style or higher budget.`);
		} else if (val > needed * 3) {
			setBudgetWarning("Great buffer — you have extra room for upgrades and savings.");
		} else {
			setBudgetWarning(`This budget fits well for a ${style.toLowerCase()} ${days}-day trip.`);
		}
	});

	const toggleInterest = (tag) => {
		setInterests((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
	};

	const handleDestinationChange = (e) => {
		const val = e.target.value;
		setDestination(val);
		setBudgetEstimateLoaded(false);
		setBudgetTier("");
		setBudgetWarning("");
	};

	const handleOriginChange = (e) => {
		const val = e.target.value;
		setOrigin(val);
	};

	const handleKeyDown = (e) => {
		if (!showSuggestions || suggestions.length === 0) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveSuggestionIdx((p) => Math.min(p + 1, suggestions.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveSuggestionIdx((p) => Math.max(p - 1, -1));
		} else if (e.key === "Enter") {
			if (activeSuggestionIdx >= 0) {
				e.preventDefault();
				selectSuggestion(suggestions[activeSuggestionIdx]);
			}
		} else if (e.key === "Escape") {
			setShowSuggestions(false);
		}
	};

	const handleOriginKeyDown = (e) => {
		if (!showOriginSuggestions || originSuggestions.length === 0) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveOriginIdx((p) => Math.min(p + 1, originSuggestions.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveOriginIdx((p) => Math.max(p - 1, -1));
		} else if (e.key === "Enter") {
			if (activeOriginIdx >= 0) {
				e.preventDefault();
				selectOriginSuggestion(originSuggestions[activeOriginIdx]);
			}
		} else if (e.key === "Escape") {
			setShowOriginSuggestions(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!budgetEstimateLoaded || !budget) {
			setError("Please select a destination first.");
			return;
		}
		setLoading(true);
		setError("");
		setResult(null);
		try {
			const data = await generateItinerary({
				origin: origin.trim() || undefined,
				destination: destination.trim(),
				start_date: startDate || undefined,
				days: duration,
				budget_inr: budget,
				interests,
				travel_style: travelStyle.toLowerCase(),
				transport_pref: transport.toLowerCase(),
			});
			if (!isResultValid(data)) {
				throw new Error("Incomplete itinerary response. Please try again.");
			}
			setResult(data);
			if (origin.trim() && startDate) {
				setLoadingFlights(true);
				try {
					const flights = await getFlights(origin.trim(), destination.trim(), startDate);
					setFlightData(flights);
				} catch {}
				setLoadingFlights(false);
			}
		} catch (err) {
			setError(err.message || "Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen" style={{ background: isResultValid(result) && !loading ? "var(--color-cream)" : "var(--color-ink)", transition: "background-color 0.5s ease" }}>
			{loading && <Loader className="anim-loader-in" />}

			{error && !loading && !result && (
				<section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px 24px", background: "var(--color-cream)" }}>
					<div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
						<div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, color: "var(--color-ink)", marginBottom: 12 }}>WARN Something went wrong</div>
						<div style={{ fontSize: 14, color: "var(--color-ink-muted)", marginBottom: 24, padding: 16, background: "var(--color-tips-bg)", border: "2px solid var(--color-ink)", borderRadius: 12 }}>{error}</div>
						<button onClick={() => { setError(""); setLoading(false); setResult(null); }} className="btn-primary" style={{ maxWidth: 220, margin: "0 auto" }}>
							Try Again
						</button>
					</div>
				</section>
			)}

			<header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 40, background: "rgba(251,246,236,0.95)", backdropFilter: "blur(8px)", borderBottom: "2.5px solid var(--color-ink)", padding: "12px 28px" }}>
				<div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
					<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
						<span style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, var(--color-coral), var(--color-rose))", display: "flex", alignItems: "center", justifyContent: "center" }}>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 4H4l-1 1 3 2 2 3 1-1v-3l4-2 3.5 4.3c.4.4.9.6 1.3.3l.5-.3c.4-.2.6-.7.5-1.2z"/></svg>
						</span>
						<span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", color: "var(--color-ink)" }}>ATP</span>
					</div>
					<span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "var(--color-lime)", color: "var(--color-ink)", padding: "5px 12px", borderRadius: 20, border: "1.5px solid var(--color-ink)", whiteSpace: "nowrap" }}>AI-powered</span>
				</div>
			</header>

			{isResultValid(result) && !loading && (
				<section className="anim-fade-in" style={{ background: "var(--color-cream)", minHeight: "100vh", padding: "80px 24px 80px" }}>
					<Results data={result} loadingFlights={loadingFlights} origin={origin} startDate={startDate} onNewSearch={() => { setResult(null); setFlightData(null); setBudgetWarning(""); setBudgetEstimateLoaded(false); }} />
				</section>
			)}

			{!result && !loading && !error && (
				<section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "80px 24px 24px" }}>
					<div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 10%, var(--color-rose) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, var(--color-purple) 0%, transparent 55%), var(--color-ink)", opacity: 0.45 }} />
					<div style={{ position: "absolute", top: -60, right: -40, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, var(--color-coral) 0%, transparent 70%)", opacity: 0.3, animation: "blobDrift 9s ease-in-out infinite" }} />
					<div style={{ position: "absolute", bottom: -100, left: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, var(--color-purple) 0%, transparent 70%)", opacity: 0.25, animation: "blobDrift 11s ease-in-out infinite reverse" }} />

					<div style={{ maxWidth: 640, width: "100%", position: "relative", textAlign: "center" }}>
						<div style={{ marginBottom: 20, display: "inline-block", animation: "floatPlane 3.5s ease-in-out infinite" }}>
							<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--color-coral)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 4H4l-1 1 3 2 2 3 1-1v-3l4-2 3.5 4.3c.4.4.9.6 1.3.3l.5-.3c.4-.2.6-.7.5-1.2z"/></svg>
						</div>
						<h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(32px, 5vw, 50px)", fontWeight: 700, color: "var(--color-cream)", letterSpacing: "-0.02em", margin: "0 0 12px", lineHeight: 1.1 }}>
							Tell us where.<br />
							<span style={{ background: "linear-gradient(120deg, var(--color-coral), var(--color-rose))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>We'll plan everything else.</span>
						</h1>
						<p style={{ fontSize: 16, color: "var(--color-ink-faint)", margin: "0 0 32px", lineHeight: 1.6 }}>
							A full itinerary — places, weather, budget, packing — built in seconds by AI.
						</p>

						<form onSubmit={handleSubmit} style={{ background: "var(--color-cream)", borderRadius: 24, padding: 28, textAlign: "left", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.5)", border: "2px solid var(--color-ink)" }}>

							{/* Origin city with autocomplete */}
							<div style={{ position: "relative", marginBottom: 16 }}>
								<label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Departing From</label>
								<input ref={originInputRef} name="origin" placeholder="Start city or airport (e.g. Mumbai, Delhi)" value={origin} onChange={handleOriginChange} onKeyDown={handleOriginKeyDown}
									onFocus={() => { originFocusedRef.current = true; if (origin.trim().length >= 2) setShowOriginSuggestions(true); }}
									onBlur={() => { originFocusedRef.current = false; setTimeout(() => { if (!originFocusedRef.current) setShowOriginSuggestions(false); }, 150); }}
									style={{ width: "100%", boxSizing: "border-box", background: "#FFFFFF", border: "2px solid var(--color-ink)", borderRadius: 14, padding: "14px 16px", fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600, color: "var(--color-ink)", outline: "none", marginBottom: showOriginSuggestions ? 0 : 6 }}
									autocomplete="off"
								/>
								{showOriginSuggestions && (
									<div ref={originSuggestionsRef} style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#FFF", border: "2px solid var(--color-ink)", borderRadius: 12, marginTop: 4, maxHeight: 220, overflowY: "auto", zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", textAlign: "left" }}>
										{originSuggestions.map((item, idx) => (
											<div key={idx} onMouseDown={(e) => { e.preventDefault(); selectOriginSuggestion(item); }} onMouseEnter={() => setActiveOriginIdx(idx)}
												style={{ padding: "12px 16px", cursor: "pointer", background: idx === activeOriginIdx ? "var(--color-ink)" : "#FFF", color: idx === activeOriginIdx ? "var(--color-cream)" : "var(--color-ink)", borderBottom: "1px solid rgba(20,23,31,0.08)", fontSize: 14, fontWeight: idx === activeOriginIdx ? 700 : 500, transition: "background 0.1s" }}>
												<span style={{ fontWeight: 700 }}>{item.name}</span>
												{" "}{item.state ? `· ${item.state}` : ""} {item.country ? `· ${item.country}` : ""}
											</div>
										))}
									</div>
								)}
								<p style={{ fontSize: 11, color: "var(--color-ink-muted)", marginTop: 6, fontWeight: 500 }}>{fetchingOrigin ? "Searching..." : "For accurate flight fare estimates"}</p>
							</div>

							{/* Destination with autocomplete */}
							<div style={{ position: "relative", marginBottom: 16 }}>
								<label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Destination</label>
								<input ref={destInputRef} name="destination" required placeholder="Start typing a city..." value={destination} onChange={handleDestinationChange} onKeyDown={handleKeyDown}
									onFocus={() => { destFocusedRef.current = true; if (destination.trim().length >= 2) setShowSuggestions(true); }}
									onBlur={() => { destFocusedRef.current = false; setTimeout(() => { if (!destFocusedRef.current) setShowSuggestions(false); }, 150); }}
									style={{ width: "100%", boxSizing: "border-box", background: "#FFFFFF", border: "2px solid var(--color-ink)", borderRadius: 14, padding: "14px 16px", fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600, color: "var(--color-ink)", outline: "none", marginBottom: showSuggestions ? 0 : 6 }}
									autocomplete="off"
								/>
								{showSuggestions && (
									<div ref={suggestionsRef} style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#FFF", border: "2px solid var(--color-ink)", borderRadius: 12, marginTop: 4, maxHeight: 220, overflowY: "auto", zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", textAlign: "left" }}>
										{suggestions.map((item, idx) => (
											<div key={idx} onMouseDown={(e) => { e.preventDefault(); selectSuggestion(item); }} onMouseEnter={() => setActiveSuggestionIdx(idx)}
												style={{ padding: "12px 16px", cursor: "pointer", background: idx === activeSuggestionIdx ? "var(--color-ink)" : "#FFF", color: idx === activeSuggestionIdx ? "var(--color-cream)" : "var(--color-ink)", borderBottom: "1px solid rgba(20,23,31,0.08)", fontSize: 14, fontWeight: idx === activeSuggestionIdx ? 700 : 500, transition: "background 0.1s" }}>
												<span style={{ fontWeight: 700 }}>{item.name}</span>
												{" "}{item.state ? `· ${item.state}` : ""} {item.country ? `· ${item.country}` : ""}
											</div>
										))}
									</div>
								)}
							</div>

							{budgetEstimateLoaded && budgetTier && (
								<div className="anim-fade-up" style={{ fontSize: 12, fontWeight: 700, color: "var(--color-ink-muted)", marginBottom: 12, marginTop: -8, marginLeft: 2 }}>
									Estimated range for {destination}: {budgetTier}
								</div>
							)}

							{!budgetEstimateLoaded && destination.trim().length >= 2 && (
								<div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink-muted)", marginBottom: 16 }}>
									{fetchingSuggestions ? "Estimating budget..." : "Select a destination to estimate your budget"}
								</div>
							)}

							{/* Date + Duration row */}
							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
								<div>
									<label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Start Date</label>
									<div style={{ position: "relative" }}>
										<input name="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
											style={{ width: "100%", boxSizing: "border-box", background: "#FFFFFF", border: "2px solid var(--color-ink)", borderRadius: 12, padding: "12px 40px 12px 14px", fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 600, color: "var(--color-ink)", outline: "none", cursor: "pointer", colorScheme: "light" }}
										/>
										<span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>📅</span>
									</div>
									<p style={{ fontSize: 11, color: "var(--color-ink-muted)", marginTop: 6, fontWeight: 500 }}>For accurate weather forecast</p>
								</div>
								<div>
									<label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Duration</label>
									<div style={{ display: "flex", gap: 6 }} role="group" aria-label="Duration">
										{DURATIONS.map((d) => (
											<button key={d} type="button" onClick={() => setDuration(d)}
												style={{ flex: 1, padding: "12px 0", border: "2px solid var(--color-ink)", borderRadius: 9, fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: d === duration ? 700 : 600, color: d === duration ? "var(--color-cream)" : "var(--color-ink-muted)", background: d === duration ? "var(--color-ink)" : "var(--color-cream)", cursor: "pointer", transition: "all 0.15s" }}>
												{d}d
											</button>
										))}
									</div>
								</div>
							</div>

							{/* Interests */}
							<label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Interests</label>
							<div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }} role="group" aria-label="Interests">
								{INTEREST_OPTIONS.map((tag) => {
									const on = interests.includes(tag);
									return (
										<button key={tag} type="button" onClick={() => toggleInterest(tag)} name="interests" value={tag}
											style={{ padding: "9px 18px", borderRadius: 20, fontSize: 13, cursor: "pointer", transition: "all 0.15s", border: on ? "1.5px solid var(--color-ink)" : "1.5px solid rgba(20,23,31,0.16)", color: on ? "var(--color-cream)" : "var(--color-ink)", background: on ? "linear-gradient(120deg, var(--color-coral), var(--color-rose))" : "var(--color-cream)", fontWeight: on ? 700 : 600, boxShadow: on ? "0 4px 12px rgba(255,46,126,0.35)" : "none", transform: on ? "translateY(-1px)" : "none" }}>
											{tag}
										</button>
									);
								})}
							</div>

							{/* Travel Style */}
							<label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Travel Style</label>
							<div className="pill-group" style={{ marginBottom: 20 }} role="radiogroup" aria-label="Travel style">
								{TRAVEL_STYLES.map((s) => (
									<button key={s} type="button" name="travel_style" value={s.toLowerCase()} onClick={() => { setTravelStyle(s); updateBudgetWarning.current(budget || 0, s, duration); }}
										style={{ flex: 1, padding: "11px 0", border: "none", borderRadius: 9, fontSize: 14, cursor: "pointer", transition: "all 0.15s", color: s === travelStyle ? "var(--color-cream)" : "var(--color-ink-muted)", background: s === travelStyle ? "var(--color-ink)" : "transparent", fontWeight: s === travelStyle ? 700 : 600, boxShadow: s === travelStyle ? "0 2px 6px rgba(20,23,31,0.3)" : "none" }}>
										{s}
									</button>
								))}
							</div>

							{/* Transport */}
							<label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Transport</label>
							<div className="pill-group" style={{ marginBottom: 28 }} role="radiogroup" aria-label="Transport">
								{TRANSPORT_OPTIONS.map((t) => (
									<button key={t} type="button" name="transport" value={t.toLowerCase()} onClick={() => setTransport(t)}
										style={{ flex: 1, padding: "11px 0", border: "none", borderRadius: 9, fontSize: 14, cursor: "pointer", transition: "all 0.15s", color: t === transport ? "var(--color-cream)" : "var(--color-ink-muted)", background: t === transport ? "var(--color-ink)" : "transparent", fontWeight: t === transport ? 700 : 600, boxShadow: t === transport ? "0 2px 6px rgba(20,23,31,0.3)" : "none" }}>
										{t}
									</button>
								))}
							</div>

							{/* Budget slider — shown after all options are set */}
							{budgetEstimateLoaded && (
								<>
									<label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Budget (₹)</label>
									<input name="budget" type="range" min={budgetMin} max={budgetMax} step={budgetMax <= 100000 ? 1000 : 5000} value={budget || 0}
										onChange={(e) => { const val = parseInt(e.target.value, 10); setBudget(val); updateBudgetWarning.current(val, travelStyle, duration); }}
										style={{ width: "100%", accentColor: "var(--color-rose)", marginBottom: 6 }}
									/>
									<div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--color-ink-muted)", marginBottom: 6 }}>
										<span>{formatINR(budgetMin)}</span>
										<span id="budget-display" style={{ color: "var(--color-ink)", fontWeight: 800, fontSize: 16, fontFamily: "var(--font-heading)" }}>{formatINR(budget)}</span>
										<span>{formatINR(budgetMax)}</span>
									</div>
									{budgetWarning && (
										<div style={{ fontSize: 12, fontWeight: 600, color: budgetWarning.startsWith("Great") || budgetWarning.startsWith("This") ? "#1E8E5A" : "#B45309", marginBottom: 16, minHeight: 18, transition: "all 0.2s" }}>
											{budgetWarning.startsWith("Great") || budgetWarning.startsWith("This") ? "OK " : "WARN "}{budgetWarning}
										</div>
									)}
								</>
							)}

							<button type="submit" className="btn-primary" disabled={loading || !budgetEstimateLoaded}>
								{loading ? "Planning your trip..." : "Plan My Trip"}
							</button>
						</form>
					</div>
				</section>
			)}

			<footer style={{ borderTop: "2px solid rgba(20,23,31,0.12)", padding: "20px 24px", textAlign: "center", color: "var(--color-ink-faint)", fontSize: 13, fontWeight: 600 }}>
				Built with AI · FastAPI + React
			</footer>
		</div>
	);
}

function formatShortINR(value) {
	if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
	if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
	return `₹${value}`;
}
