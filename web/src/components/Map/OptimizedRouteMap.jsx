import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const STATUS_COLORS = {
  full: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  empty: '#94a3b8',
};

export default function OptimizedRouteMap({ stops = [], depot, isLive = false }) {
  if (!stops || stops.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-50 rounded-xl" style={{ minHeight: '400px'}}>
        <p className="text-gray-400">
          Generate a route to see the optimized path
        </p>
      </div>
    );
  }

  const sorted = [...stops].sort(
    (a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)
  );

  const coords = sorted
    .filter(s => (s.lat && s.lng) || (s.bin_lat && s.bin_lng))
    .map(s => [s.lat ?? s.bin_lat, s.lng ?? s.bin_lng]);

  const center = depot?.lat 
    ? [depot.lat, depot.lng] 
    : coords[0] || [21.2514, 81.6296];

  let allCoords = [];
  if (depot?.lat) {
     allCoords = [[depot.lat, depot.lng], ...coords, [depot.lat, depot.lng]];
  } else {
     allCoords = coords;
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-200">
      {/* Live indicator */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-green-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow">
        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} />
        {isLive ? 'Live Optimizing...' : 'Route Visualizer'}
      </div>
      
      <MapContainer center={center} zoom={13} style={{ height: '100%', minHeight: '400px', width: '100%', zIndex: 10 }}>
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {depot?.lat && (
          <Marker position={[depot.lat, depot.lng]}>
            <Popup>Base Depot</Popup>
          </Marker>
        )}
        {sorted.map((stop, i) => {
          const lat = stop.lat ?? stop.bin_lat;
          const lng = stop.lng ?? stop.bin_lng;
          if (lat && lng) {
            return (
              <Marker key={i} position={[lat, lng]}>
                <Popup>Stop {i + 1}: {stop.label || stop.bin_label || 'Bin'}</Popup>
              </Marker>
            );
          }
          return null;
        })}
        {allCoords.length > 1 && (
          <Polyline positions={allCoords} color="#16a34a" weight={4} dashArray="8 4" />
        )}
      </MapContainer>
    </div>
  );
}
