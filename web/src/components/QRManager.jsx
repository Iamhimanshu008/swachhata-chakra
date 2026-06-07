import React, { useState, useEffect } from 'react';
import { getCitizensByWard, updateQRStatus } from '../api/adminApi';
import { Download, Edit2, AlertTriangle, ShieldCheck, Lock, CheckCircle } from 'lucide-react';
import client from '../api/client';

const QRManager = () => {
    const [wardNo, setWardNo] = useState(4); // Default ward 4
    const [citizens, setCitizens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCitizens();
    }, [wardNo]);

    const fetchCitizens = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCitizensByWard(wardNo);
            setCitizens(data);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to fetch citizens");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = `${client.defaults.baseURL}/admin/qr/bulk_pdf?ward_no=${wardNo}`;
            
            // Triggering download via fetch to include authorization headers properly
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error("Failed to download PDF");
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `Ward_${wardNo}_QRs.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleStatusUpdate = async (houseId, newStatus) => {
        try {
            await updateQRStatus(houseId, newStatus);
            setCitizens(citizens.map(c => c.house_id === houseId ? { ...c, qr_status: newStatus } : c));
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to update status");
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'damaged': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'stolen': return <ShieldCheck className="w-4 h-4 text-red-500" />;
            case 'locked': return <Lock className="w-4 h-4 text-gray-500" />;
            default: return <CheckCircle className="w-4 h-4 text-green-500" />;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'damaged': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'stolen': return 'bg-red-100 text-red-800 border-red-200';
            case 'locked': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Household & QR Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage physical QR codes and household GIS data for Ward {wardNo}</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <label className="text-sm font-medium text-gray-700 mr-2">Ward:</label>
                        <input 
                            type="number" 
                            min="1" 
                            max="50" 
                            value={wardNo} 
                            onChange={(e) => setWardNo(Number(e.target.value))}
                            className="bg-transparent border-none focus:ring-0 w-16 text-sm font-semibold p-0"
                        />
                    </div>
                    <button 
                        onClick={handleDownloadPDF}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download Bulk QR Sheet (PDF)
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2 border border-red-100">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">House ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GIS Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                        <span className="ml-2">Loading households...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : citizens.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No citizens registered in Ward {wardNo} yet.
                                </td>
                            </tr>
                        ) : (
                            citizens.map((citizen) => (
                                <tr key={citizen.house_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono text-sm font-medium text-gray-900">{citizen.house_id}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{citizen.full_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {citizen.socio_category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {citizen.lat && citizen.lng ? (
                                                <span className="flex items-center gap-1">
                                                    📍 {citizen.lat.toFixed(4)}, {citizen.lng.toFixed(4)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Unmapped</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusBadgeClass(citizen.qr_status)}`}>
                                            {getStatusIcon(citizen.qr_status)}
                                            {(citizen.qr_status || '').charAt(0).toUpperCase() + (citizen.qr_status || '').slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <select 
                                            value={citizen.qr_status}
                                            onChange={(e) => handleStatusUpdate(citizen.house_id, e.target.value)}
                                            className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-1 pl-2 pr-8"
                                        >
                                            <option value="active">Active</option>
                                            <option value="damaged">Damaged</option>
                                            <option value="stolen">Stolen</option>
                                            <option value="locked">Locked</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QRManager;
