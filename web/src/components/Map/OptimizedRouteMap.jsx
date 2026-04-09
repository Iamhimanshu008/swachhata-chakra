import React, { useEffect, useRef } from 'react';

const STATUS_COLORS = {
  full: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  empty: '#94a3b8',
};

function getFillColor(stop) {
  const level = stop.fill_level || 0;
  const status = stop.status || '';
  if (status === 'full' || level >= 90) return STATUS_COLORS.full;
  if (level >= 70) return STATUS_COLORS.high;
  if (level >= 50) return STATUS_COLORS.medium;
  if (level >= 20) return STATUS_COLORS.low;
  return STATUS_COLORS.empty;
}

export default function OptimizedRouteMap({ stops = [], isLive = false }) {
  const hasStops = stops.length > 0;

  // Normalize coordinates to SVG viewport (800 x 500)
  const PAD = 60;
  const W = 800, H = 500;

  let points = [];
  if (hasStops) {
    const lats = stops.map(s => s.lat);
    const lngs = stops.map(s => s.lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 0.01;
    const lngRange = maxLng - minLng || 0.01;

    points = stops.map(s => ({
      ...s,
      x: PAD + ((s.lng - minLng) / lngRange) * (W - PAD * 2),
      // Invert Y: higher lat = higher on screen
      y: H - PAD - ((s.lat - minLat) / latRange) * (H - PAD * 2),
    }));
  }

  // Depot: centroid or fixed fallback
  const depotX = hasStops ? (points.reduce((a, p) => a + p.x, 0) / points.length) : W / 2;
  const depotY = hasStops ? Math.min(...points.map(p => p.y)) - 40 : 80;

  // Build polyline path: depot → stops in sequence → depot
  const allPoints = hasStops
    ? [{ x: depotX, y: depotY }, ...points, { x: depotX, y: depotY }]
    : [];
  const polyline = allPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  return (
    <div className="relative w-full h-full bg-[#e8f4ea] rounded-xl overflow-hidden border border-green-200">
      {/* Live indicator */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-green-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow">
        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} />
        {isLive ? 'Live Optimizing...' : 'Route Visualizer'}
      </div>

      {/* Legend */}
      <div className="absolute top-3 right-3 z-10 bg-white/90 rounded-lg shadow p-2 text-xs space-y-1">
        <div className="font-semibold text-gray-700 mb-1">ROUTE LEGEND</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-green-800 inline-block"/> Base Depot</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-500 inline-block"/> Waste Bin</div>
        <div className="flex items-center gap-2"><span className="w-6 h-0.5 bg-green-900 inline-block"/> Active Route</div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c8e6c9" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />

        {/* Route polyline */}
        {hasStops && (
          <path
            d={polyline}
            fill="none"
            stroke="#1b5e20"
            strokeWidth="2.5"
            strokeDasharray="8 4"
            strokeLinecap="round"
            opacity="0.8"
          />
        )}

        {/* Depot marker */}
        <g transform={`translate(${depotX}, ${depotY})`}>
          <rect x="-18" y="-18" width="36" height="36" rx="6" fill="#1b5e20" />
          <text textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="white">🏭</text>
          <text x="0" y="28" textAnchor="middle" fontSize="10" fill="#1b5e20" fontWeight="bold">Base Depot</text>
        </g>

        {/* Bin markers */}
        {points.map((p, i) => (
          <g key={p.bin_id} transform={`translate(${p.x}, ${p.y})`}>
            {/* Connecting line label */}
            <circle r="18" fill={getFillColor(p)} opacity="0.15" />
            <circle r="14" fill={getFillColor(p)} />
            <text textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="white" fontWeight="bold">
              {i + 1}
            </text>
            {/* Bin label */}
            <text x="0" y="26" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">
              {p.label?.length > 14 ? p.label.slice(0, 14) + '…' : p.label}
            </text>
            <text x="0" y="37" textAnchor="middle" fontSize="8" fill="#6b7280">
              {p.fill_level}%
            </text>
          </g>
        ))}

        {/* Empty state */}
        {!hasStops && (
          <text x={W/2} y={H/2} textAnchor="middle" fontSize="14" fill="#6b7280">
            Generate a route to see the optimized path
          </text>
        )}
      </svg>
    </div>
  );
}
