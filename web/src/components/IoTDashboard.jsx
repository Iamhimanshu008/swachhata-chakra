import React, { useState, useEffect } from 'react';
import { Cpu, Battery, Wifi, AlertOctagon, Scale } from 'lucide-react';
import { getIoTScalesStatus, registerIoTScale, pairIoTScale, getUsers } from '../api/adminApi';

const IoTDashboard = () => {
    const [scales, setScales] = useState([]);
    const [collectors, setCollectors] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [serialNumber, setSerialNumber] = useState('');
    const [macAddress, setMacAddress] = useState('');
    const [selectedCollector, setSelectedCollector] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const scalesData = await getIoTScalesStatus();
            setScales(scalesData);
            
            const usersData = await getUsers();
            setCollectors(usersData.filter(u => u.role === 'collector'));
        } catch (error) {
            console.error('Error fetching IoT data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const newScale = await registerIoTScale({ serial_number: serialNumber, mac_address: macAddress });
            if (selectedCollector) {
                await pairIoTScale(newScale.id, parseInt(selectedCollector));
            }
            // Reset form and refresh
            setSerialNumber('');
            setMacAddress('');
            setSelectedCollector('');
            fetchData();
        } catch (error) {
            console.error('Error registering scale:', error);
            alert('Failed to register scale. Please check the serial number and MAC address.');
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading IoT data...</div>;
    }

    const activeScalesCount = scales.filter(s => s.status === 'active').length;
    const lowBatteryCount = scales.filter(s => s.battery_level < 20).length;
    const tamperedCount = scales.filter(s => s.is_tampered).length;

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Cpu className="mr-2 text-indigo-600" /> IoT Telemetry Dashboard
            </h2>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Active Scales</p>
                        <h3 className="text-2xl font-bold text-gray-800">{activeScalesCount}</h3>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                        <Scale className="text-indigo-600" size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Low Battery Warnings</p>
                        <h3 className="text-2xl font-bold text-yellow-600">{lowBatteryCount}</h3>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                        <Battery className="text-yellow-600" size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Tamper Alerts</p>
                        <h3 className="text-2xl font-bold text-red-600">{tamperedCount}</h3>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                        <AlertOctagon className="text-red-600" size={24} />
                    </div>
                </div>
            </div>

            {/* Registration Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Register New Scale</h3>
                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                        <input
                            type="text"
                            required
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            placeholder="e.g., SCALE-1001"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">MAC Address</label>
                        <input
                            type="text"
                            required
                            value={macAddress}
                            onChange={(e) => setMacAddress(e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            placeholder="00:1B:44:11:3A:B7"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pair Collector (Optional)</label>
                        <select
                            value={selectedCollector}
                            onChange={(e) => setSelectedCollector(e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                        >
                            <option value="">-- None --</option>
                            {collectors.map(c => (
                                <option key={c.id} value={c.id}>{c.name} (ID: {c.id})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Register Device
                        </button>
                    </div>
                </form>
            </div>

            {/* Hardware Health Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">Hardware Health</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Info</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collector</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Heartbeat</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {scales.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No IoT scales registered yet.</td>
                                </tr>
                            ) : (
                                scales.map((scale) => (
                                    <tr key={scale.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{scale.serial_number}</div>
                                            <div className="text-sm text-gray-500">{scale.mac_address}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {scale.paired_collector_id ? `Collector #${scale.paired_collector_id}` : <span className="text-gray-400">Unpaired</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                                    <div 
                                                        className={`h-2.5 rounded-full ${scale.battery_level > 50 ? 'bg-green-500' : scale.battery_level > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                                        style={{ width: `${Math.min(100, Math.max(0, scale.battery_level))}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600">{scale.battery_level.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                {scale.is_online ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <Wifi className="w-3 h-3 mr-1" /> Online
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Offline
                                                    </span>
                                                )}
                                                
                                                {scale.is_tampered && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <AlertOctagon className="w-3 h-3 mr-1" /> Tampered
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {scale.last_heartbeat ? new Date(scale.last_heartbeat).toLocaleString() : 'Never'}
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

export default IoTDashboard;
