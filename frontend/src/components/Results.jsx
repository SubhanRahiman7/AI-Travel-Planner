import { formatINR } from "../api";

const dayIcon = (dayNum) => {
	const icons = ["🌅", "🏛️", "🏔️", "🍜", "🌃", "🎨", "🏖️"];
	return icons[(dayNum - 1) % icons.length];
};

function MapView({ coords, places }) {
	if (!coords) return null;
	const { lat, lon } = coords;
	const points = [coords, ...places.filter(p => p.lat && p.lon).map(p => ({ lat: p.lat, lon: p.lon, name: p.name }))];
	if (points.length === 1) {
		const d = 0.05;
		const bbox = `${lon - d},${lat - d},${lon + d},${lat + d}`;
		return (
			<div className="rounded-xl overflow-hidden border border-white/10">
				<iframe
					title="destination-map"
					width="100%"
					height="320"
					frameBorder="0"
					scrolling="no"
					src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
				/>
			</div>
		);
	}
	const lats = points.map(p => p.lat);
	const lons = points.map(p => p.lon);
	const dLat = (Math.max(...lats) - Math.min(...lats)) / 2 + 0.02;
	const dLon = (Math.max(...lons) - Math.min(...lons)) / 2 + 0.02;
	const bbox = `${Math.min(...lons) - dLon},${Math.min(...lats) - dLat},${Math.max(...lons) + dLon},${Math.max(...lats) + dLat}`;
	return (
		<div className="rounded-xl overflow-hidden border border-white/10">
			<iframe
				title="destination-map"
				width="100%"
				height="360"
				frameBorder="0"
				scrolling="no"
				src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
			/>
			<div className="bg-slate-900/80 px-4 py-2 text-xs text-slate-400 flex flex-wrap gap-3">
				<span className="text-indigo-400">● Destination</span>
				{points.slice(1).map((p, i) => (
					<span key={i} className="text-pink-400">● {p.name}</span>
				))}
			</div>
		</div>
	);
}

export default function Results({ data }) {
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
		{destination_coords && (
			<p className="text-white/50 text-xs mt-2 flex items-center gap-1.5">
			<span>📍</span> {destination_coords.display_name}
			</p>
		)}
		</div>
		<div className="text-right">
		<p className="text-white/60 text-xs uppercase tracking-wider mb-1">Total Budget</p>
		<p className="text-2xl font-bold text-white">{formatINR(budget.total)}</p>
		</div>
		</div>
		</div>

		{/* Weather + Map row */}
		{(weather.length > 0 || destination_coords) && (
			<div className="grid lg:grid-cols-2 gap-6">
			{weather.length > 0 && (
				<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
				<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
					🌤️ Weather Forecast
				</h3>
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
				{weather.slice(0, 6).map((w, i) => {
					const date = new Date(w.date);
					const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
					const dayNum = date.getDate();
					return (
					<div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/5 hover:border-white/20 transition">
					<p className="text-xs text-slate-400 uppercase">{dayName}</p>
					<p className="text-white font-semibold text-sm">{dayNum}</p>
					<p className="text-2xl my-1">{w.description.split(" ")[0]}</p>
					<p className="text-xs text-slate-300">
					<span className="text-amber-400">{Math.round(w.temp_max)}°</span>
					{" / "}
					<span className="text-sky-300">{Math.round(w.temp_min)}°</span>
					</p>
					{w.precip_mm > 0 && (
						<p className="text-[10px] text-sky-400 mt-1">💧 {w.precip_mm}mm</p>
					)}
					</div>
					);
				})}
				</div>
				</div>
			)}
			{destination_coords && (
				<div>
				<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
					🗺️ Destination Map
				</h3>
				<MapView coords={destination_coords} places={enriched_places} />
				</div>
			)}
			</div>
		)}

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

		{/* Enriched Places */}
		{enriched_places.length > 0 && (
			<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
			<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
				📍 Must-Visit Places
			</h3>
			<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{enriched_places.map((p, i) => (
				<div key={i} className="bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition group">
				{p.image && (
					<div className="h-32 bg-slate-800 overflow-hidden">
					<img src={p.image} alt={p.name}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
						onError={(e) => e.target.style.display = "none"}
					/>
					</div>
				)}
				<div className="p-3">
				<h4 className="font-semibold text-white text-sm mb-1">{p.name}</h4>
				{p.description && (
					<p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{p.description}</p>
				)}
				{p.url && (
					<a href={p.url} target="_blank" rel="noopener noreferrer"
						className="text-[11px] text-indigo-400 hover:text-indigo-300 mt-2 inline-block">
						Read more on Wikipedia →
					</a>
				)}
				</div>
				</div>
			))}
			</div>
			</div>
		)}

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