import { formatINR } from "../api";

const dayIcon = (dayNum) => {
 const icons = ["🌅", "🏛️", "🏔️", "🍜", "🌃", "🎨", "🏖️"];
 return icons[(dayNum - 1) % icons.length];
};

export default function Results({ data }) {
 const { destination, trip_summary, days, budget, packing_list, tips } = data;

 const totalSpent =
 budget.flights +
 budget.hotels +
 budget.food +
 budget.transport +
 budget.activities;
 const budgetRemaining = budget.total - totalSpent;

 const budgetItems = [
 { label: "Flights", value: budget.flights, color: "bg-sky-500", icon: "✈️" },
 { label: "Hotels", value: budget.hotels, color: "bg-violet-500", icon: "🏨" },
 { label: "Food", value: budget.food, color: "bg-amber-500", icon: "🍽️" },
 { label: "Transport", value: budget.transport, color: "bg-teal-500", icon: "🚗" },
 { label: "Activities", value: budget.activities, color: "bg-pink-500", icon: "🎟️" },
 ];

 const maxVal = Math.max(...budgetItems.map((b) => b.value));

 return (
 <div className="space-y-8 animate-fade-in">
 {/* Trip Summary */}
 <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 shadow-xl shadow-indigo-600/20">
 <div className="flex items-start justify-between flex-wrap gap-4">
 <div>
 <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
 {destination} ✨
 </h2>
 <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl">{trip_summary}</p>
 </div>
 <div className="text-right">
 <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Total Budget</p>
 <p className="text-2xl font-bold text-white">{formatINR(budget.total)}</p>
 </div>
 </div>
 </div>

 {/* Budget Breakdown */}
 <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
 <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
 💰 Budget Breakdown
 </h3>
 <div className="space-y-4">
 {budgetItems.map((item) => {
 const pct = (item.value / maxVal) * 100;
 return (
 <div key={item.label}>
 <div className="flex justify-between text-sm mb-1.5">
 <span className="text-slate-300 flex items-center gap-2">
 <span>{item.icon}</span>
 {item.label}
 </span>
 <span className="text-slate-400 font-mono">{formatINR(item.value)}</span>
 </div>
 <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
 <div
 className={`h-full ${item.color} rounded-full transition-all duration-700 ease-out`}
 style={{ width: `${pct}%` }}
 />
 </div>
 </div>
 );
 })}
 </div>
 <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-sm">
 <div className="flex items-center gap-2">
 <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
 <span className="text-slate-400">Total: </span>
 <span className="text-white font-semibold">{formatINR(totalSpent)}</span>
 </div>
 {budgetRemaining >= 0 ? (
 <div className="flex items-center gap-2">
 <span className="text-slate-400">Remaining: </span>
 <span className="text-emerald-400 font-semibold">{formatINR(budgetRemaining)}</span>
 </div>
 ) : (
 <div className="flex items-center gap-2">
 <span className="text-slate-400">Over budget by: </span>
 <span className="text-red-400 font-semibold">{formatINR(Math.abs(budgetRemaining))}</span>
 </div>
 )}
 </div>
 </div>

 {/* Day-by-day itinerary */}
 <div className="space-y-4">
 <h3 className="text-lg font-semibold text-white flex items-center gap-2">
 📅 Day-by-Day Itinerary
 </h3>
 {days.map((day) => (
 <div
 key={day.day}
 className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 sm:p-6 hover:border-white/20 transition-colors"
 >
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-lg">
 {dayIcon(day.day)}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
 <h4 className="font-semibold text-white">
 Day {day.day}: <span className="text-indigo-300">{day.title}</span>
 </h4>
 <span className="text-xs text-slate-500 font-mono">
 ~{formatINR(day.estimated_cost_inr)}
 </span>
 </div>
 <div className="grid sm:grid-cols-2 gap-4">
 <div>
 <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
 Activities
 </p>
 <ul className="space-y-1.5">
 {day.activities.map((act, i) => (
 <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
 <span className="text-indigo-400 mt-0.5">▸</span>
 {act}
 </li>
 ))}
 </ul>
 </div>
 <div>
 <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
 Meals
 </p>
 <ul className="space-y-1.5">
 {day.meals.map((meal, i) => (
 <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
 <span className="text-amber-400 mt-0.5">•</span>
 {meal}
 </li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Packing List */}
 <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
 <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
 🎒 Packing List
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {packing_list.map((item, i) => (
 <div key={i} className="flex items-center gap-2.5 text-sm text-slate-300 bg-white/5 rounded-lg px-3 py-2">
 <input type="checkbox" className="accent-indigo-500 w-4 h-4 rounded" />
 {item}
 </div>
 ))}
 </div>
 </div>

 {/* Travel Tips */}
 <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 sm:p-8">
 <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
 💡 Travel Tips
 </h3>
 <ul className="space-y-2.5">
 {tips.map((tip, i) => (
 <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
 <span className="text-amber-400 mt-0.5 flex-shrink-0">▸</span>
 {tip}
 </li>
 ))}
 </ul>
 </div>

 <div className="text-center py-4 text-slate-500 text-xs">
 Generated by AI · Always verify details before traveling
 </div>
 </div>
 );
}
