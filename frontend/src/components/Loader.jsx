export default function Loader() {
 return (
 <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
 <div className="relative mb-6">
 <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin-slow" />
 <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse-glow">
 🤖
 </div>
 </div>
 <p className="text-indigo-300 font-medium text-lg">Crafting your dream itinerary...</p>
 <p className="text-slate-500 text-sm mt-2">This usually takes 10–20 seconds</p>
 </div>
 );
}
