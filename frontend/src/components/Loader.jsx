import { useEffect, useState } from "react";

const LOADING_STEPS = [
 "Generating plan",
 "Enriching places",
 "Getting weather",
 "Almost done",
];

export default function Loader() {
 const [step, setStep] = useState(0);

 useEffect(() => {
 const timer = setInterval(() => {
 setStep((s) => (s + 1) % LOADING_STEPS.length);
 }, 900);
 return () => clearInterval(timer);
 }, []);

 return (
 <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "var(--color-ink)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
 <div style={{ position: "absolute", top: -100, left: -60, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, var(--color-coral), transparent 70%)", opacity: 0.35, animation: "blobDrift 6s ease-in-out infinite" }} />
 <div style={{ position: "absolute", bottom: -120, right: -60, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, var(--color-purple), transparent 70%)", opacity: 0.3, animation: "blobDrift 7s ease-in-out infinite reverse" }} />

 <div style={{ position: "relative", textAlign: "center", padding: 24 }}>
 <div style={{ fontSize: 56, animation: "floatPlane 1.6s ease-in-out infinite" }}>🧭</div>
 <div style={{ marginTop: 22, fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "var(--color-cream)" }}>
 Building your itinerary
 <span>
 <span style={{ animation: "dotPulse 1.4s infinite" }}>.</span>
 <span style={{ animation: "dotPulse 1.4s infinite 0.2s" }}>.</span>
 <span style={{ animation: "dotPulse 1.4s infinite 0.4s" }}>.</span>
 </span>
 </div>
 <div style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: "var(--color-coral)", minHeight: 22 }}>{LOADING_STEPS[step]}</div>
 </div>
 </div>
 );
}
