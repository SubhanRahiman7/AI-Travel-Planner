export default function MapView({ coords, places }) {
 if (!coords) return null;
 const { lat, lon } = coords;
 const validPlaces = places.filter(p => p.lat && p.lon);
 const points = [coords, ...validPlaces.map(p => ({ lat: p.lat, lon: p.lon, name: p.name }))];

 let bbox;
 if (points.length === 1) {
 const d = 0.05;
 bbox = `${lon - d},${lat - d},${lon + d},${lat + d}`;
 } else {
 const lats = points.map(p => p.lat);
 const lons = points.map(p => p.lon);
 const dLat = (Math.max(...lats) - Math.min(...lats)) / 2 + 0.02;
 const dLon = (Math.max(...lons) - Math.min(...lons)) / 2 + 0.02;
 bbox = `${Math.min(...lons) - dLon},${Math.min(...lats) - dLat},${Math.max(...lons) + dLon},${Math.max(...lats) + dLat}`;
 }

 return (
 <iframe
 title="destination-map"
 width="100%"
 height="320"
 frameBorder="0"
 scrolling="no"
 style={{ display: "block", minHeight: 220 }}
 src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
 />
 );
}
