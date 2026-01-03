'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PatientPortal() {
    const params = useParams();
    const tokenId = params.tokenId;
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    // Station Display Names & Rooms
    const STATION_INFO = {
        'registration': { name: 'Registration Desk', room: 'Lobby', icon: '📋' },
        'vision_test': { name: 'Vision Testing', room: 'Room 104', icon: '👁️' },
        'refraction': { name: 'Refraction (Glasses)', room: 'Room 105', icon: '👓' },
        'dilation': { name: 'Dilation Waiting', room: 'Dilation Area', icon: '💧' },
        'fundus_photo': { name: 'Fundus Imaging', room: 'Room 108', icon: '📸' },
        'investigation': { name: 'Lab Investigation', room: 'Lab 1', icon: '🔬' },
        'iop_check': { name: 'IOP / Glaucoma', room: 'Room 106', icon: '💨' },
        'doctor_consult': { name: 'Doctor Consultation', room: 'Room 201', icon: '👨‍⚕️' },
        'pharmacy': { name: 'Pharmacy', room: 'Ground Floor', icon: '💊' },
        'trauma_center': { name: 'Trauma Center', room: 'Red Zone', icon: '🚨' },
        'discharge': { name: 'Discharge', room: 'Exit', icon: '👋' }
    };

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/patient-status?tokenId=${tokenId}`);
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data);
                }
                setLoading(false);
            } catch (e) {
                console.error(e);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, [tokenId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading your journey...</div>;
    if (!status) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-400">Token Invalid</div>;

    const currentInfo = STATION_INFO[status.currentStation] || { name: status.currentStation, room: 'Unknown', icon: '📍' };

    // Calculate Progress
    const totalSteps = status.pathway.length;
    const currentStepIndex = status.pathway.indexOf(status.currentStation);
    const progress = ((currentStepIndex + 1) / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-slate-100 font-sans pb-10">
            {/* Header */}
            <div className="bg-sky-600 text-white p-6 rounded-b-[2rem] shadow-lg mb-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">{tokenId}</h1>
                        <p className="text-sky-100 text-sm">Patient Token</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${status.esiLevel === 1 ? 'bg-red-500 text-white' :
                        status.esiLevel === 2 ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
                        }`}>
                        ESI-{status.esiLevel}
                    </div>
                </div>

                {/* Main Status Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className="text-sky-100 text-xs uppercase font-bold mb-1">Current Status</div>
                    <div className="text-2xl font-bold flex items-center gap-2">
                        {currentInfo.icon} {currentInfo.name}
                    </div>
                    <div className="mt-2 flex gap-4 text-sm">
                        <div>
                            <span className="block text-sky-200 text-xs">Queue Position</span>
                            <span className="font-bold text-xl">{status.queuePosition > 0 ? `#${status.queuePosition}` : 'Now Serving'}</span>
                        </div>
                        <div>
                            <span className="block text-sky-200 text-xs">Est. Wait</span>
                            <span className="font-bold text-xl">{status.estimatedWait}m</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wayfinding / Action */}
            <div className="px-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Your Next Step</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center text-2xl">
                            📍
                        </div>
                        <div>
                            <div className="text-lg font-bold text-slate-800">Go to {currentInfo.room}</div>
                            <div className="text-slate-500 text-sm">Follow the <span className="text-sky-600 font-bold">Blue Line</span> on the floor</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Uber-style Timeline */}
            <div className="px-6">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Treatment Journey</h3>
                <div className="relative pl-4 border-l-2 border-slate-200 space-y-8">
                    {status.pathway.map((step, idx) => {
                        const info = STATION_INFO[step] || { name: step, icon: '📍' };
                        const isCompleted = idx < currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        const isFuture = idx > currentStepIndex;

                        return (
                            <div key={step} className={`relative pl-6 transition-all ${isFuture ? 'opacity-40' : 'opacity-100'}`}>
                                {/* Dot */}
                                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 
                                    ${isCompleted ? 'bg-emerald-500 border-emerald-500' :
                                        isCurrent ? 'bg-sky-600 border-sky-600 ring-4 ring-sky-100' :
                                            'bg-white border-slate-300'}`}>
                                </div>

                                <div className="font-bold text-slate-800 text-lg">{info.name}</div>
                                {isCurrent && (
                                    <div className="text-sky-600 text-sm font-medium animate-pulse">In Progress...</div>
                                )}
                                {isCompleted && (
                                    <div className="text-emerald-600 text-xs font-bold">Completed</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
