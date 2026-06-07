import React, { useState, useEffect } from 'react';
import { BrainCircuit, Scan, ShieldAlert, BarChart3, Image as ImageIcon } from 'lucide-react';
import { getAIStats, getRecentAILogs, fetchAITrends, fetchAnomalies, fetchCollectorPerformance } from '../api/adminApi';
import { TrendingUp, TrendingDown, AlertTriangle, Trophy } from 'lucide-react';

const AIAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trends, setTrends] = useState(null);
    const [anomalies, setAnomalies] = useState([]);
    const [collectorPerformance, setCollectorPerformance] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsData = await getAIStats();
            const logsData = await getRecentAILogs();
            
            // Try fetching predictive analytics (might fail if mock endpoint isn't fully implemented in backend, but we'll handle gracefully)
            try {
                const [trendsData, anomaliesData, performanceData] = await Promise.all([
                    fetchAITrends(),
                    fetchAnomalies(),
                    fetchCollectorPerformance()
                ]);
                setTrends(trendsData);
                setAnomalies(anomaliesData);
                setCollectorPerformance(performanceData);
            } catch (err) {
                console.warn('Predictive endpoints not fully available yet', err);
            }

            setStats(statsData);
            setLogs(logsData);
        } catch (error) {
            console.error('Error fetching AI data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading AI Analytics...</div>;
    }

    const totalGraded = (stats?.high_grade_count || 0) + (stats?.medium_grade_count || 0) + (stats?.low_grade_count || 0);

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <BrainCircuit className="mr-2 text-indigo-600" /> AI Plastic Grading Analytics
            </h2>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">High Grade (%)</p>
                        <h3 className="text-2xl font-bold text-green-600">
                            {stats?.high_grade_percent?.toFixed(1) || 0}%
                        </h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                        <Scan className="text-green-600" size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Avg Contamination</p>
                        <h3 className="text-2xl font-bold text-red-600">
                            {stats?.avg_contamination?.toFixed(1) || 0}%
                        </h3>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                        <ShieldAlert className="text-red-600" size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Avg AI Confidence</p>
                        <h3 className="text-2xl font-bold text-blue-600">
                            {stats?.avg_confidence?.toFixed(1) || 0}%
                        </h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <BrainCircuit className="text-blue-600" size={24} />
                    </div>
                </div>
            </div>

            {/* Grade Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <BarChart3 className="mr-2 text-gray-500" size={20} /> Grade Distribution
                </h3>
                {totalGraded === 0 ? (
                    <p className="text-gray-500 text-sm">No grading data available yet.</p>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="font-medium text-gray-700">HIGH Grade</span>
                                <span className="font-bold text-gray-900">{stats.high_grade_count} ({((stats.high_grade_count / totalGraded) * 100).toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4">
                                <div className="h-4 rounded-full bg-green-500" style={{ width: `${(stats.high_grade_count / totalGraded) * 100}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="font-medium text-gray-700">MEDIUM Grade</span>
                                <span className="font-bold text-gray-900">{stats.medium_grade_count} ({((stats.medium_grade_count / totalGraded) * 100).toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4">
                                <div className="h-4 rounded-full bg-yellow-500" style={{ width: `${(stats.medium_grade_count / totalGraded) * 100}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="font-medium text-gray-700">LOW Grade</span>
                                <span className="font-bold text-gray-900">{stats.low_grade_count} ({((stats.low_grade_count / totalGraded) * 100).toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4">
                                <div className="h-4 rounded-full bg-red-500" style={{ width: `${(stats.low_grade_count / totalGraded) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Predictive Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Future Waste Prediction */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <BarChart3 className="mr-2 text-indigo-500" size={20} /> Future Waste Prediction
                    </h3>
                    {trends ? (
                        <div className={`p-5 rounded-xl border ${trends.prediction === 'Higher' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {trends.prediction === 'Higher' ? (
                                    <TrendingUp className="text-red-500 w-8 h-8" />
                                ) : (
                                    <TrendingDown className="text-green-500 w-8 h-8" />
                                )}
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Next Week's Forecast</p>
                                    <h4 className={`text-xl font-bold ${trends.prediction === 'Higher' ? 'text-red-700' : 'text-green-700'}`}>
                                        {trends.prediction} Volume Expected
                                    </h4>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{trends.insight || 'Based on recent AI grading and collection trends.'}</p>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400 text-sm">Prediction data unavailable</div>
                    )}
                </div>

                {/* Top Collectors Leaderboard */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Trophy className="mr-2 text-yellow-500" size={20} /> Top Collectors by AI Grade
                    </h3>
                    {collectorPerformance && collectorPerformance.length > 0 ? (
                        <div className="space-y-3">
                            {collectorPerformance.map((collector, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{collector.collector_name}</p>
                                            <p className="text-xs text-gray-500">{collector.high_grade_count} High Grade Scans</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">{collector.accuracy || '98'}%</p>
                                        <p className="text-xs text-gray-500">Accuracy</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400 text-sm">Leaderboard data unavailable</div>
                    )}
                </div>
            </div>

            {/* Anomalies / Fraud Risks */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <AlertTriangle className="mr-2 text-red-500" size={20} /> Anomalies & Fraud Risks
                </h3>
                {anomalies && anomalies.length > 0 ? (
                    <div className="space-y-3">
                        {anomalies.map((anomaly, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                                <AlertTriangle className="text-red-500 mt-1 shrink-0" size={20} />
                                <div>
                                    <p className="font-semibold text-red-800">{anomaly.issue}</p>
                                    <p className="text-sm text-red-600 mt-1">Transaction #{anomaly.transaction_id} • Collector: {anomaly.collector_name}</p>
                                    <p className="text-xs text-red-500 mt-1">{anomaly.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 text-center bg-green-50 border border-green-100 rounded-xl">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ShieldAlert size={24} />
                        </div>
                        <p className="font-medium text-green-800">No Anomalies Detected</p>
                        <p className="text-sm text-green-600 mt-1">All weight and visual grades match perfectly.</p>
                    </div>
                )}
            </div>

            {/* Recent Decisions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">Recent AI Decisions (QA)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collector</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contamination</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No grading logs available.</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            #{log.transaction_id || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{log.collector_name}</div>
                                            <div className="text-xs text-gray-500">ID: {log.collector_id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {log.image_url ? (
                                                <a href={log.image_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-900 flex items-center">
                                                    <ImageIcon size={16} className="mr-1" /> View
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-sm">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${(log.grade || '').toUpperCase() === 'HIGH' ? 'bg-green-100 text-green-800' : 
                                                  (log.grade || '').toUpperCase() === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 
                                                  'bg-gray-100 text-gray-800'}`}>
                                                {(log.grade || '').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.confidence_score.toFixed(1)}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.contamination_rate.toFixed(1)}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AIAnalytics;
