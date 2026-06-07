import React, { useState, useMemo } from 'react';
import { Map, MapPin, AlertTriangle, Filter, Search, ShieldCheck } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import locationData from '../../../../locationData.json';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored markers
const createColoredIcon = (colorClass) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-md ${colorClass}"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
};

const greenIcon = createColoredIcon('bg-[#16A34A]');
const orangeIcon = createColoredIcon('bg-[#EA580C]');
const redIcon = createColoredIcon('bg-[#DC2626]');

export default function GeographicAnalyticsTab() {
    const [selectedState] = useState('Chhattisgarh');
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [selectedBlock, setSelectedBlock] = useState('all');
    const [selectedPanchayat, setSelectedPanchayat] = useState('all');

    // Parse location data
    const districtsList = useMemo(() => Object.keys(locationData || {}).map(d => {
        // Mock a little coverage score for colors
        // Summing character codes to make it stable
        const scoreHash = d.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const coverage = 40 + (scoreHash % 61); // 40 to 100%
        return {
            name: d,
            cleanName: d.split(' (')[0],
            code: d.split(' (')[1]?.replace(')', '') || '-',
            blocks: Object.keys(locationData[d] || {}).length,
            panchayats: Object.values(locationData[d] || {}).reduce((acc, curr) => acc + Object.keys(curr).length, 0),
            coverage,
            // Randomish coords near CG center [21.2787, 81.8661]
            lat: 21.2787 + ((scoreHash % 40) - 20) / 10,
            lng: 81.8661 + (((scoreHash * 3) % 40) - 20) / 10
        };
    }), []);

    const blocksList = useMemo(() => {
        if (selectedDistrict === 'all' || !locationData[selectedDistrict]) return [];
        return Object.keys(locationData[selectedDistrict]);
    }, [selectedDistrict]);

    const panchayatsList = useMemo(() => {
        if (selectedDistrict === 'all' || selectedBlock === 'all' || !locationData[selectedDistrict]?.[selectedBlock]) return [];
        return Object.keys(locationData[selectedDistrict][selectedBlock]);
    }, [selectedDistrict, selectedBlock]);

    // Top 5 performing
    const topPerforming = useMemo(() => {
        return [...districtsList].sort((a, b) => b.coverage - a.coverage).slice(0, 5);
    }, [districtsList]);

    // Critical Areas
    const criticalAreas = useMemo(() => {
        return [...districtsList].sort((a, b) => a.coverage - b.coverage).slice(0, 3);
    }, [districtsList]);

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#14532D] font-display">Geographic Operations</h2>
                    <p className="text-sm text-gray-500">Real-time territorial tracking & coverage analytics</p>
                </div>
            </div>

            {/* Drill-down Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 overflow-x-auto">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl min-w-[200px]">
                    <Map className="w-4 h-4 text-gray-400" />
                    <select className="bg-transparent text-sm font-medium text-gray-700 w-full outline-none" disabled>
                        <option>Chhattisgarh</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl min-w-[200px]">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <select 
                        className="bg-transparent text-sm font-medium text-gray-700 w-full outline-none"
                        value={selectedDistrict}
                        onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setSelectedBlock('all');
                            setSelectedPanchayat('all');
                        }}
                    >
                        <option value="all">All Districts</option>
                        {districtsList.map(d => <option key={d.name} value={d.name}>{d.cleanName}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl min-w-[200px]">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <select 
                        className="bg-transparent text-sm font-medium text-gray-700 w-full outline-none"
                        value={selectedBlock}
                        onChange={(e) => {
                            setSelectedBlock(e.target.value);
                            setSelectedPanchayat('all');
                        }}
                        disabled={selectedDistrict === 'all'}
                    >
                        <option value="all">All Blocks</option>
                        {blocksList.map(b => <option key={b} value={b}>{b.split(' (')[0]}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl min-w-[200px]">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <select 
                        className="bg-transparent text-sm font-medium text-gray-700 w-full outline-none"
                        value={selectedPanchayat}
                        onChange={(e) => setSelectedPanchayat(e.target.value)}
                        disabled={selectedBlock === 'all'}
                    >
                        <option value="all">All Panchayats</option>
                        {panchayatsList.map(p => <option key={p} value={p}>{p.split(' (')[0]}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Map Area */}
                <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col min-h-[500px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-[#14532D]">Live Territory Map</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-xs font-medium"><div className="w-3 h-3 rounded-full bg-[#16A34A]"></div> 80% Coverage</div>
                            <div className="flex items-center gap-2 text-xs font-medium"><div className="w-3 h-3 rounded-full bg-[#EA580C]"></div> 50-80% Coverage</div>
                            <div className="flex items-center gap-2 text-xs font-medium"><div className="w-3 h-3 rounded-full bg-[#DC2626]"></div> &lt;50% Coverage</div>
                        </div>
                    </div>
                    
                    <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden relative" style={{ height: '500px' }}>
                        <MapContainer center={[21.2787, 81.8661]} zoom={7} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {districtsList.map((dist, idx) => {
                                const icon = dist.coverage > 80 ? greenIcon : dist.coverage > 50 ? orangeIcon : redIcon;
                                return (
                                    <Marker key={idx} position={[dist.lat, dist.lng]} icon={icon}>
                                        <Popup>
                                            <div className="p-1">
                                                <h3 className="font-bold text-[#14532D] mb-1">{dist.cleanName}</h3>
                                                <p className="text-xs text-gray-600">Total Blocks: {dist.blocks}</p>
                                                <p className="text-xs text-gray-600">Total Panchayats: {dist.panchayats}</p>
                                                <div className="mt-2 text-xs font-bold bg-gray-100 px-2 py-1 rounded inline-block">
                                                    Coverage: <span className={dist.coverage > 80 ? 'text-green-600' : dist.coverage > 50 ? 'text-orange-600' : 'text-red-600'}>{dist.coverage}%</span>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                    </div>
                </div>

                {/* Right Column: Performance Rankings */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-[#14532D] mb-4">Ward Ranking (Top 5)</h3>
                        <div className="space-y-4">
                            {topPerforming.map((dist, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-sm font-semibold text-gray-700">{i+1}. {dist.cleanName}</span>
                                        <span className="text-xs font-bold text-[#16A34A]">{dist.coverage}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#16A34A]" style={{ width: `${dist.coverage}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-[#14532D]">Critical Wards</h3>
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">Attention</span>
                        </div>
                        <div className="space-y-3">
                            {criticalAreas.map((dist, i) => (
                                <div key={i} className="flex gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                                    <div className="mt-0.5">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">{dist.cleanName}</p>
                                        <p className="text-xs text-red-600 mt-0.5">Coverage dropped to {dist.coverage}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Table */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-[#14532D] mb-4">Ward Performance Details</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-y border-gray-100">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">District</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">District Code</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Blocks</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Panchayats</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Coverage %</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ward Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[...districtsList].sort((a,b) => b.coverage - a.coverage).slice(0, 10).map((dist, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-bold text-gray-500 text-center w-12">{i + 1}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{dist.cleanName}</td>
                                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{dist.code}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{dist.blocks}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{dist.panchayats}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-[#16A34A] text-right">{dist.coverage}%</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-700 text-right">{dist.coverage * 10}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
