import { useState, useEffect } from 'react';
import { Users, MapPin, Clock, WifiOff, Trophy, CheckCircle2, AlertCircle } from 'lucide-react';
import * as adminApi from '../api/adminApi';

export default function CollectorManagement() {
    const [attendance, setAttendance] = useState([]);
    const [performance, setPerformance] = useState([]);
    const [syncStatus, setSyncStatus] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [attData, perfData, syncData] = await Promise.all([
                    adminApi.getCollectorsAttendance(),
                    adminApi.getCollectorsPerformance(),
                    adminApi.getCollectorsSyncStatus()
                ]);
                setAttendance(attData);
                setPerformance(perfData);
                setSyncStatus(syncData);
            } catch (error) {
                console.error("Failed to fetch collector data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // refresh every minute
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sw-mid"></div>
            </div>
        );
    }

    // Top Metric Cards calculations
    const totalActiveToday = attendance.filter(a => a.status === 'present').length;
    const totalHousesCovered = performance.reduce((sum, p) => sum + p.houses_covered, 0);
    const pendingSyncs = syncStatus.filter(s => s.pending_afternoon_batch || s.status === 'pending_sync').length;

    // Join attendance and syncStatus for the Tracker Table
    const trackerData = syncStatus.map(sync => {
        const att = attendance.find(a => a.collector_id === sync.collector_id);
        return {
            ...sync,
            check_in_time: att?.check_in_time,
            attendance_status: att?.status || 'absent'
        };
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active Collectors Today</p>
                        <h4 className="text-2xl font-bold text-gray-900">{totalActiveToday}</h4>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Houses Covered</p>
                        <h4 className="text-2xl font-bold text-gray-900">{totalHousesCovered}</h4>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                        <WifiOff className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pending Offline Syncs</p>
                        <h4 className="text-2xl font-bold text-gray-900">{pendingSyncs}</h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tracker Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 font-display flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-500" />
                            Attendance & Sync Tracker
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Collector</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Ward</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Check-in</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Progress</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Sync Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {trackerData.map(data => {
                                    const progress = data.total_houses > 0 
                                        ? Math.min(100, Math.round((data.completed_houses / data.total_houses) * 100)) 
                                        : 0;
                                    
                                    return (
                                        <tr key={data.collector_id} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{data.name}</td>
                                            <td className="px-4 py-3 text-gray-500">{data.ward_no || '-'}</td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {data.check_in_time 
                                                    ? new Date(data.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                                    : 'Not Checked In'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                                            style={{ width: `${progress}%` }} 
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-600">{data.completed_houses}/{data.total_houses}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {data.pending_afternoon_batch ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                                        <AlertCircle className="w-3 h-3" /> Pending Batch
                                                    </span>
                                                ) : data.status === 'synced' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        <CheckCircle2 className="w-3 h-3" /> Synced
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                        {data.status.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {trackerData.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                <p>No active collectors found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Leaderboard */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                        <h3 className="font-bold text-amber-900 font-display flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            Top Swachhta Mitras
                        </h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {performance.slice(0, 5).map((collector, index) => (
                            <div key={collector.collector_id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                    ${index === 0 ? 'bg-amber-100 text-amber-600' : 
                                      index === 1 ? 'bg-gray-200 text-gray-600' : 
                                      index === 2 ? 'bg-orange-100 text-orange-700' : 
                                      'bg-blue-50 text-blue-600'}`}>
                                    #{index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{collector.name}</p>
                                    <p className="text-xs text-gray-500">Ward {collector.ward_no || '-'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sw-mid">{collector.weight_kg} kg</p>
                                    <p className="text-xs text-gray-500">{collector.houses_covered} houses</p>
                                </div>
                            </div>
                        ))}
                        {performance.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                <p>No performance data for today</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
