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
 destination: e.target.destination.value,
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
 <div className="min-h-screen bg-[#0f172a] text-slate-100">
 {/* Header */}
 <header className="relative overflow-hidden border-b border-white/10">
 <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 opacity-90" />
 <div className="absolute inset-0 opacity-20"
 style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}
 />
 <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
 <div className="flex items-center gap-3 mb-2">
 <span className="text-4xl">✈️</span>
 <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
 AI Travel Planner
 </h1>
 </div>
 <p className="text-white/80 text-base sm:text-lg max-w-2xl ml-1">
 Tell us your dream trip — AI builds the perfect itinerary in seconds.
 </p>
 </div>
 </header>

 <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
 {loading && <Loader />}
 {error && (
 <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 animate-fade-in">
 <span className="font-semibold">Error:</span> {error}
 </div>
 )}
 {result && <Results data={result} />}

 {/* Form */}
 <form
 onSubmit={handleSubmit}
 className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 ${result ? "mb-8" : ""}`}
 >
 <h2 className="text-xl font-semibold text-white mb-1">Plan Your Trip</h2>
 <p className="text-slate-400 text-sm mb-6">Fill in the details and let AI do the rest.</p>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 {/* Destination */}
 <div className="sm:col-span-2">
 <label className="block text-sm font-medium text-slate-300 mb-1.5">Destination</label>
 <input name="destination" required placeholder="e.g. Japan, Paris, Goa"
 className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
 </div>

 {/* Days */}
 <div>
 <label className="block text-sm font-medium text-slate-300 mb-1.5">Duration (days)</label>
 <input name="days" type="number" min="1" max="30" required defaultValue="5"
 className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
 </div>

 {/* Budget */}
 <div>
 <label className="block text-sm font-medium text-slate-300 mb-1.5">Budget (₹ INR)</label>
 <input name="budget" type="number" min="100" required placeholder="50000"
 className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
 </div>

 {/* Interests */}
 <div className="sm:col-span-2">
 <label className="block text-sm font-medium text-slate-300 mb-1.5">Interests</label>
 <input name="interests" placeholder="hiking, food, history, photography..."
 className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
 <p className="text-xs text-slate-500 mt-1.5">Comma-separated. e.g. hiking, street food, temples</p>
 </div>

 {/* Travel style */}
 <div>
 <label className="block text-sm font-medium text-slate-300 mb-1.5">Travel Style</label>
 <select name="travel_style"
 className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition">
 <option value="budget">Budget</option>
 <option value="moderate" selected>Moderate</option>
 <option value="luxury">Luxury</option>
 <option value="balanced">Balanced</option>
 </select>
 </div>

 {/* Transport */}
 <div>
 <label className="block text-sm font-medium text-slate-300 mb-1.5">Transport Preference</label>
 <select name="transport"
 className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition">
 <option value="public">Public Transport</option>
 <option value="private">Private / Taxi</option>
 <option value="mixed">Mixed</option>
 </select>
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50"
 >
 {loading ? (
 <>
 <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
 <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
 <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
 </svg>
 Generating your itinerary...
 </>
 ) : (
 <>✨ Generate Itinerary</>
 )}
 </button>
 </form>
 </main>

 <footer className="border-t border-white/10 py-6 text-center text-slate-500 text-sm">
 Built with AI · Gemini + FastAPI + React
 </footer>
 </div>
 );
}
