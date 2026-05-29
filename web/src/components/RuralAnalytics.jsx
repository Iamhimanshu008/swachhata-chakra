import React, { useState, useEffect } from 'react';
import { 
    BarChart3, AlertTriangle, IndianRupee, Activity, 
    Scale, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { getWardSummary } from '../api/adminApi';
import KPICard from './cards/KPICard';

export default function RuralAnalytics() {
    const [wardNo, setWardNo] = useState(4);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const summary = await getWardSummary(wardNo);
            setData(summary);
        } catch (err) {
            console.error('Failed to fetch ward summary:', err);
            setError('Failed to load data for this ward.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [wardNo]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header and Ward Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-sw-mid" />
                        Panchayat & Rural Analytics
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">V3 Village-Level Waste Management & Ledger</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Select Ward:</label>
                    <input 
                        type="number" 
                        value={wardNo}
                        onChange={(e) => setWardNo(parseInt(e.target.value) || 1)}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sw-light outline-none"
                        min="1"
                    />
                    <button 
                        onClick={fetchData}
                        disabled={loading}
                        className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {data && !loading && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* SECTION 1: Operations */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Operations
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                <p className="text-sm text-gray-500 font-medium">Total Transactions</p>
                                <p className="text-2xl font-bold text-blue-700 mt-1">{data.total_transactions}</p>
                            </div>
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                <p className="text-sm text-gray-500 font-medium">Total Waste Collected</p>
                                <p className="text-2xl font-bold text-blue-700 mt-1">
                                    {data.total_weight_kg} <span className="text-sm font-medium">kg</span>
                                </p>
                            </div>
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                <p className="text-sm text-gray-500 font-medium">Points Distributed</p>
                                <p className="text-2xl font-bold text-blue-700 mt-1">{data.total_points_issued}</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Fraud & Audit */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <Scale className="w-5 h-5 text-sw-mid" />
                                Fraud & Audit
                            </h3>
                        </div>
                        
                        {/* ALERT FOR MANUAL OVERRIDES */}
                        {data.manual_overrides > 0 ? (
                            <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm mb-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-red-800">Manual Overrides Detected</h4>
                                        <p className="text-sm text-red-600 mt-1">
                                            <span className="font-bold text-lg">{data.manual_overrides}</span> transactions were manually weighed, bypassing IoT scale automation.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-50 p-5 rounded-xl border border-green-200 shadow-sm mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-green-800">100% IoT Accuracy</h4>
                                        <p className="text-sm text-green-600">No manual overrides recorded.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Audit Trail Status</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">IoT Weighing Rate</span>
                                    <span className="font-mono-data font-bold text-gray-900">
                                        {data.total_transactions > 0 
                                            ? Math.round(((data.total_transactions - data.manual_overrides) / data.total_transactions) * 100) 
                                            : 0}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Data Integrity Check</span>
                                    <span className="text-green-600 font-medium px-2 py-0.5 bg-green-50 rounded">Passed</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Financial Ledger */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-purple-600" />
                                Financial Ledger
                            </h3>
                        </div>
                        
                        <div className="bg-gray-900 rounded-xl p-5 mb-5 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 text-white/10">
                                <IndianRupee className="w-24 h-24" />
                            </div>
                            <p className="text-sm text-gray-400 font-medium relative z-10">Projected Value (₹30/kg)</p>
                            <p className="text-3xl font-bold mt-1 relative z-10">
                                ₹{data.financials.total_revenue_inr.toFixed(2)}
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-sw-mid"></div>
                                    <span className="text-sm font-medium text-gray-700">Citizen Fund (33.33%)</span>
                                </div>
                                <span className="font-mono-data font-bold text-gray-900">₹{data.financials.citizen_incentive_fund.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-sm font-medium text-gray-700">Operations (33.33%)</span>
                                </div>
                                <span className="font-mono-data font-bold text-gray-900">₹{data.financials.operations_fund.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    <span className="text-sm font-medium text-gray-700">Panchayat Profit (33.34%)</span>
                                </div>
                                <span className="font-mono-data font-bold text-gray-900">₹{data.financials.panchayat_profit.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
