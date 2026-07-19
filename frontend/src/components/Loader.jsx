import { useEffect, useState } from "react";

const STEPS = ["Generating plan", "Enriching places", "Getting weather", "Almost done"];

const TAGLINES = [
 "Mapping the best routes for you…",
 "Curating hidden gems and local favorites…",
 "Checking the skies for your travel dates…",
 "Putting the final touches on your trip…",
];

export default function Loader({ className = "" }) {
 const [stepIndex, setStepIndex] = useState(0);
 const [progress, setProgress] = useState(0);

 useEffect(() => {
 const timer = setInterval(() => {
 setProgress((p) => {
 const next = Math.min(100, p + 100 / STEPS.length / 14);
 const nextStep = Math.min(STEPS.length - 1, Math.floor((next / 100) * STEPS.length));
 setStepIndex(nextStep);
 if (next >= 100) {
 setTimeout(() => {
 setProgress(0);
 setStepIndex(0);
 }, 900);
 }
 return next;
 });
 }, 90);
 return () => clearInterval(timer);
 }, []);

 const steps = STEPS.map((label, i) => {
 const done = i < stepIndex || progress >= 100;
 const active = i === stepIndex && !done;
 return {
 label,
 done,
 active,
 opacity: done || active ? 1 : 0.4,
iconWrapStyleObj: { width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#0B0D14", background: done ? "#C9FF4D" : active ? "rgba(255,90,60,0.15)" : "rgba(255,255,255,0.08)", border: "1.5px solid " + (done ? "#C9FF4D" : active ? "#FF5A3C" : "rgba(255,255,255,0.15)"), transition: "all .3s" },
 textStyleObj: { fontSize: 14, fontWeight: active ? 700 : 600, color: done ? "#FBF6EC" : "#6B7280", transition: "all .3s" },
 };
 });

 const progressPct = Math.round(progress);
 const tagline = TAGLINES[stepIndex];

 return (
 <div
 className={className}
 style={{
 position: "fixed",
 inset: 0,
 zIndex: 100,
 background: "#0B0D14",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 overflow: "hidden",
 padding: 24,
 }}
 >
 <div
 style={{
 position: "absolute",
 top: -160,
 left: -120,
 width: 480,
 height: 480,
 borderRadius: "50%",
 background: "radial-gradient(circle, #FF2E7E 0%, transparent 70%)",
 opacity: 0.4,
 animation: "blobDrift 9s ease-in-out infinite",
 filter: "blur(10px)",
 }}
 />
 <div
 style={{
 position: "absolute",
 bottom: -180,
 right: -140,
 width: 520,
 height: 520,
 borderRadius: "50%",
 background: "radial-gradient(circle, #7C5CFF 0%, transparent 70%)",
 opacity: 0.35,
 animation: "blobDrift2 11s ease-in-out infinite",
 filter: "blur(10px)",
 }}
 />
 <div
 style={{
 position: "absolute",
 top: "20%",
 right: "10%",
 width: 260,
 height: 260,
 borderRadius: "50%",
 background: "radial-gradient(circle, #FF5A3C 0%, transparent 70%)",
 opacity: 0.25,
 animation: "blobDrift 7s ease-in-out infinite reverse",
 filter: "blur(8px)",
 }}
 />

 <div style={{ position: "relative", zIndex: 2, maxWidth: 460, width: "100%", textAlign: "center" }}>
 <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 32px" }}>
 <div
 style={{
 position: "absolute",
 inset: 0,
 borderRadius: "50%",
 border: "1.5px dashed rgba(255,255,255,0.18)",
 animation: "spin 14s linear infinite",
 }}
 />
 <div
 style={{
 position: "absolute",
 inset: 14,
 borderRadius: "50%",
 border: "1.5px dashed rgba(255,255,255,0.12)",
 animation: "spinRev 10s linear infinite",
 }}
 />
 <div
 style={{
 position: "absolute",
 inset: 30,
 borderRadius: "50%",
 background: "radial-gradient(circle at 35% 30%, #1c2030, #0B0D14 70%)",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 animation: "ringPulse 2.4s ease-out infinite",
 }}
 >
 <svg
 width={34}
 height={34}
 viewBox="0 0 24 24"
 style={{ display: "block", animation: "floatY 2.6s ease-in-out infinite" }}
 >
 <defs>
 <linearGradient id="planeGrad" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0" stopColor="#FF5A3C" />
 <stop offset="1" stopColor="#FF2E7E" />
 </linearGradient>
 </defs>
 <path d="M2 12L22 3L14 21L11 13L2 12Z" fill="url(#planeGrad)" />
 <path d="M11 13L22 3" stroke="rgba(255,255,255,0.55)" strokeWidth={0.7} />
 </svg>
 </div>
 </div>

 <h1
 style={{
 fontFamily: '"Space Grotesk", sans-serif',
 fontSize: 26,
 fontWeight: 700,
 color: "#FBF6EC",
 margin: "0 0 10px",
 letterSpacing: "-0.01em",
 }}
 >
 Building your itinerary
 <span>
 <span style={{ animation: "dotPulse 1.4s infinite" }}>.</span>
 <span style={{ animation: "dotPulse 1.4s infinite 0.2s" }}>.</span>
 <span style={{ animation: "dotPulse 1.4s infinite 0.4s" }}>.</span>
 </span>
 </h1>

 <div
 style={{
 fontSize: 14,
 color: "#8A93A6",
 marginBottom: 24,
 minHeight: 20,
 transition: "opacity .2s",
 }}
 >
 {tagline}
 </div>

 <div style={{ marginBottom: 32 }}>
 <div className="loader-track" style={{ position: "relative" }}>
 <div
 style={{
 position: "absolute",
 inset: "auto 42.5% 0",
 aspectRatio: 1,
 borderRadius: "50%",
 background: "linear-gradient(135deg, #FF5A3C, #FF2E7E)",
 animation: "loaderBall .75s cubic-bezier(0,900,1,900) infinite",
 }}
 />
 </div>
 <div
 style={{
 fontFamily: '"Space Mono", "Courier New", monospace',
 fontSize: 20,
 fontWeight: 700,
 color: "#FF5A3C",
 textAlign: "center",
 }}
 >
 {progressPct}%
 </div>
 </div>

 <div style={{ textAlign: "left", marginBottom: 28 }}>
 {steps.map((step, i) => (
 <div
 key={i}
 style={{
 display: "flex",
 alignItems: "center",
 gap: 14,
 padding: "10px 0",
 opacity: step.opacity,
 transition: "opacity .3s",
 }}
 >
 <div style={step.iconWrapStyleObj}>
 {step.done && (
 <span style={{ animation: "popIn .3s ease-out" }}>{"✓"}</span>
 )}
 {step.active && (
 <span
 style={{
 width: 8,
 height: 8,
 borderRadius: "50%",
 background: "#FF5A3C",
 display: "block",
 animation: "dotPulse 1s infinite",
 }}
 />
 )}
 </div>
 <div style={step.textStyleObj}>{step.label}</div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
