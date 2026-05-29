import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Map, Globe, Shield, Plus, Building, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import * as adminApi from '../api/adminApi';

export default function PanchayatOnboarding() {
    const [panchayats, setPanchayats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPanchayat, setSelectedPanchayat] = useState(null);
    const [vitals, setVitals] = useState(null);
    const [error, setError] = useState(null);

    // Form state for creating sub-admin
    const [subAdminForm, setSubAdminForm] = useState({
        name: '',
        phone: '',
        email: '',
        password: ''
    });
    const [submittingAdmin, setSubmittingAdmin] = useState(false);

    useEffect(() => {
        loadPanchayats();
    }, []);

    const loadPanchayats = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getPanchayats();
            setPanchayats(data);
            if (data.length > 0 && !selectedPanchayat) {
                setSelectedPanchayat(data[0]);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load panchayats");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedPanchayat) {
            loadVitals(selectedPanchayat.id);
        }
    }, [selectedPanchayat]);

    const loadVitals = async (id) => {
        try {
            const data = await adminApi.getPanchayatVitals(id);
            setVitals(data);
        } catch (err) {
            console.error("Vitals load error", err);
        }
    };

    const handleApprove = async (id) => {
        try {
            await adminApi.approvePanchayat(id);
            loadPanchayats(); // Reload to reflect changes
        } catch (err) {
            alert("Failed to approve panchayat");
        }
    };

    const handleSubAdminSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPanchayat) return;
        
        setSubmittingAdmin(true);
        try {
            await adminApi.createSubAdmin(selectedPanchayat.id, subAdminForm);
            alert("Sub-Admin (Sachiv) created successfully!");
            setSubAdminForm({ name: '', phone: '', email: '', password: '' });
        } catch (err) {
            console.error(err);
            alert("Failed to create Sub-Admin. Check if email/phone already exists.");
        } finally {
            setSubmittingAdmin(false);
        }
    };

    if (loading && panchayats.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sw-green" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-sw-dark">Gram Panchayat Onboarding</h2>
                    <p className="text-gray-500">State Admin Approval Queue & Sarpanch Portal</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: State Admin Queue */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Building className="w-4 h-4 text-sw-green" />
                                Panchayat Queue
                            </h3>
                            <span className="text-xs font-medium bg-green-100 text-sw-green px-2 py-1 rounded-full">
                                {panchayats.length} total
                            </span>
                        </div>
                        
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {panchayats.map(p => (
                                <div 
                                    key={p.id}
                                    onClick={() => setSelectedPanchayat(p)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                        selectedPanchayat?.id === p.id 
                                            ? 'border-sw-green bg-green-50 shadow-sm' 
                                            : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{p.name}</h4>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <Map className="w-3 h-3" /> {p.district}
                                            </p>
                                        </div>
                                        {p.is_approved ? (
                                            <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                <CheckCircle className="w-3 h-3" /> Approved
                                            </span>
                                        ) : (
                                            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                    
                                    {!p.is_approved && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleApprove(p.id); }}
                                            className="mt-3 w-full py-2 bg-sw-mid text-white text-sm font-medium rounded-lg hover:bg-sw-dark transition-colors"
                                        >
                                            Approve Panchayat
                                        </button>
                                    )}
                                </div>
                            ))}
                            {panchayats.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    No Panchayats found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sarpanch Dashboard View */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedPanchayat ? (
                        <>
                            {/* Header Info */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                                {/* Saffron/Green Decorative Banner */}
                                <div className="absolute top-0 left-0 w-full h-1 flex">
                                    <div className="h-full w-1/3 bg-[#FF9933]"></div>
                                    <div className="h-full w-1/3 bg-white"></div>
                                    <div className="h-full w-1/3 bg-[#138808]"></div>
                                </div>
                                
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                                            {selectedPanchayat.name} 
                                            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                ID: {selectedPanchayat.id}
                                            </span>
                                        </h3>
                                        <p className="text-gray-500 text-sm flex items-center gap-1">
                                            <Globe className="w-4 h-4" /> District: {selectedPanchayat.district}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Sarpanch</p>
                                        <p className="font-medium text-gray-900">{selectedPanchayat.sarpanch_name || 'N/A'}</p>
                                        <p className="text-sm text-gray-500">{selectedPanchayat.sarpanch_phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Village Vital Meter */}
                            {vitals && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-sw-green" />
                                        Village Vitals & Onboarding Progress
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                            <p className="text-orange-600 text-xs font-semibold uppercase tracking-wide">Population</p>
                                            <p className="text-2xl font-bold text-orange-900 mt-1">{vitals.population.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <p className="text-blue-600 text-xs font-semibold uppercase tracking-wide">Total Houses</p>
                                            <p className="text-2xl font-bold text-blue-900 mt-1">{vitals.total_houses.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                            <p className="text-green-600 text-xs font-semibold uppercase tracking-wide">Target Houses</p>
                                            <p className="text-2xl font-bold text-green-900 mt-1">{vitals.target_houses.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">QR Door-to-Door Registration</p>
                                                <p className="text-xs text-gray-500">{vitals.registered_houses} of {vitals.target_houses} houses mapped</p>
                                            </div>
                                            <span className="text-lg font-bold text-sw-dark">{vitals.onboarding_progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3 mb-1 overflow-hidden">
                                            <div 
                                                className="bg-[#138808] h-3 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.min(vitals.onboarding_progress, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sub-Admin Creator */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-sw-green" />
                                    Sub-Admin (Sachiv) Creation
                                </h4>
                                <p className="text-sm text-gray-500 mb-6">Create a login for the Panchayat Sachiv or local admin to manage day-to-day operations.</p>
                                
                                <form onSubmit={handleSubAdminSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                                        <input 
                                            required
                                            type="text" 
                                            className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sw-mid/20 focus:border-sw-mid outline-none transition-all"
                                            placeholder="Sachiv Name"
                                            value={subAdminForm.name}
                                            onChange={e => setSubAdminForm({...subAdminForm, name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input 
                                            required
                                            type="tel" 
                                            className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sw-mid/20 focus:border-sw-mid outline-none transition-all"
                                            placeholder="9876543210"
                                            value={subAdminForm.phone}
                                            onChange={e => setSubAdminForm({...subAdminForm, phone: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Email (Login ID)</label>
                                        <input 
                                            required
                                            type="email" 
                                            className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sw-mid/20 focus:border-sw-mid outline-none transition-all"
                                            placeholder="sachiv@panchayat.gov"
                                            value={subAdminForm.email}
                                            onChange={e => setSubAdminForm({...subAdminForm, email: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                                        <input 
                                            required
                                            type="password" 
                                            className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sw-mid/20 focus:border-sw-mid outline-none transition-all"
                                            placeholder="••••••••"
                                            value={subAdminForm.password}
                                            onChange={e => setSubAdminForm({...subAdminForm, password: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="md:col-span-2 mt-2">
                                        <button 
                                            type="submit" 
                                            disabled={submittingAdmin}
                                            className="flex items-center justify-center gap-2 bg-sw-dark text-white px-6 py-2.5 rounded-xl hover:bg-sw-mid transition-all font-medium disabled:opacity-70 w-full md:w-auto"
                                        >
                                            {submittingAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                            Create Sachiv Account
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Map className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No Panchayat Selected</h3>
                            <p className="text-gray-500">Select a panchayat from the queue to view its vitals and manage access.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
