'use client';

import { useState, useEffect } from 'react';

export default function DoctorDashboard() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Poll for updates every 5 seconds
    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const res = await fetch('/api/emr');
                const data = await res.json();
                setPatients(data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch EMR data", err);
            }
        };

        fetchQueue();
        const interval = setInterval(fetchQueue, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 font-sans p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">eyeNotes™ EMR Dashboard</h1>
                        <p className="text-sm text-slate-500">Live Triage Queue • Thanjavur Centre</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white px-4 py-2 rounded shadow text-center">
                            <div className="text-xs text-slate-400 uppercase">Waiting</div>
                            <div className="text-xl font-bold text-slate-800">{patients.filter(p => p.status === 'waiting').length}</div>
                        </div>
                        <div className="bg-white px-4 py-2 rounded shadow text-center">
                            <div className="text-xs text-slate-400 uppercase">Seen</div>
                            <div className="text-xl font-bold text-slate-800">{patients.filter(p => p.status !== 'waiting').length}</div>
                        </div>
                    </div>
                </div>

                {/* Station Selection Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <a href="/station-display/vision_test" target="_blank" className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all text-center group">
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">👁️</div>
                        <div className="font-bold text-slate-700">Vision Station</div>
                        <div className="text-xs text-slate-400">View Queue</div>
                    </a>
                    <a href="/station-display/iop_check" target="_blank" className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all text-center group">
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">💨</div>
                        <div className="font-bold text-slate-700">IOP / Glaucoma</div>
                        <div className="text-xs text-slate-400">View Queue</div>
                    </a>
                    <a href="/station-display/doctor_consult" target="_blank" className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all text-center group">
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">👨‍⚕️</div>
                        <div className="font-bold text-slate-700">Doctor Room</div>
                        <div className="text-xs text-slate-400">View Queue</div>
                    </a>
                    <a href="/station-display/pharmacy" target="_blank" className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all text-center group">
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">💊</div>
                        <div className="font-bold text-slate-700">Pharmacy</div>
                        <div className="text-xs text-slate-400">View Queue</div>
                    </a>
                    <a href="/station-display/emergency_room" target="_blank" className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all text-center group">
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🚨</div>
                        <div className="font-bold text-slate-700">Emergency</div>
                        <div className="text-xs text-slate-400">View Queue</div>
                    </a>
                </div>

                {/* Queue Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Token</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Complaint</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">AI Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Severity</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading live data...</td></tr>
                            ) : patients.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No patients in queue</td></tr>
                            ) : (
                                patients.map((p) => (
                                    <tr key={p.token} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-slate-700">{p.token}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-800 font-medium">{p.complaint}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 border border-slate-200">
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${p.severity === 'high' ? 'bg-red-500' :
                                                p.severity === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                                }`}></span>
                                            <span className="text-xs uppercase font-bold text-slate-500">{p.severity}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.status === 'waiting' ? (
                                                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded">Waiting</span>
                                            ) : (
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Checked In</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-sky-600 hover:text-sky-800 text-xs font-bold uppercase transition-colors">
                                                Call Patient
                                            </button>
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
}
