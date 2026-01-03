'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function StationDisplay() {
    const params = useParams();
    const stationId = params.stationId;
    const [queueData, setQueueData] = useState(null);
    const [loading, setLoading] = useState(true);

    const STATIONS_READABLE = {
        registration: "Registration Desk",
        vision_test: "Vision Testing (Room 1)",
        iop_check: "IOP / Glaucoma Check",
        doctor_consult: "Doctor Consultation",
        emergency_room: "EMERGENCY / TRIAGE",
        pharmacy: "Pharmacy"
    };

    const fetchQueue = async () => {
        try {
            const res = await fetch(`/api/queue/station?id=${stationId}`);
            const data = await res.json();
            setQueueData(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [stationId]);

    if (loading) return <div className="p-10 text-xl">Loading Station Data...</div>;

    const nextPatient = queueData?.nextPatient;
    const waitingList = queueData?.queue?.slice(1) || [];

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col md:flex-row gap-6">

            {/* Left: Now Serving (Big Display) */}
            <div className="w-full md:w-1/2 bg-white rounded-3xl shadow-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full bg-slate-800 text-white py-3 font-bold uppercase tracking-wider">
                    {STATIONS_READABLE[stationId] || stationId}
                </div>

                <h2 className="text-slate-400 font-bold uppercase tracking-widest mt-10 mb-4">Now Serving</h2>

                {nextPatient ? (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <div className={`text-9xl font-black mb-4 ${nextPatient.esiLevel === 1 ? 'text-red-600' :
                            nextPatient.esiLevel === 2 ? 'text-orange-500' :
                                nextPatient.esiLevel === 3 ? 'text-yellow-500' :
                                    'text-green-500'
                            }`}>
                            {nextPatient.tokenId}
                        </div>
                        <div className="text-2xl font-bold text-slate-700">{nextPatient.name}</div>

                        <div className="mt-8 flex gap-3 justify-center">
                            <span className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-mono">
                                Waited: {nextPatient.waitMinutes}m
                            </span>
                            <span className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold tracking-wider">
                                ESI LEVEL {nextPatient.esiLevel}
                            </span>
                        </div>

                        <button
                            className="mt-10 w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={async () => {
                                if (!confirm("Mark patient as done and move to next station?")) return;
                                try {
                                    await fetch('/api/queue/advance', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ tokenId: nextPatient.tokenId })
                                    });
                                    // Refresh data immediately
                                    fetchQueue();
                                } catch (e) {
                                    alert("Error moving patient");
                                }
                            }}
                        >
                            COMPLETE & CALL NEXT
                        </button>
                    </div>
                ) : (
                    <div className="text-slate-300 font-bold text-3xl">
                        NO PATIENTS WAITING
                    </div>
                )}
            </div>

            {/* Right: Up Next List */}
            <div className="w-full md:w-1/2 bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
                <div className="bg-slate-100 p-6 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-700">Up Next ({waitingList.length})</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {waitingList.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-12 rounded-full ${p.esiLevel === 1 ? 'bg-red-500' :
                                    p.esiLevel === 2 ? 'bg-orange-400' :
                                        p.esiLevel === 3 ? 'bg-yellow-400' :
                                            'bg-green-500'
                                    }`}></div>
                                <div>
                                    <div className="font-bold text-xl text-slate-800">{p.tokenId}</div>
                                    <div className="text-sm text-slate-400">{p.name}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono font-bold text-slate-600">{p.waitMinutes} m</div>
                                <div className="text-[10px] text-slate-400 uppercase">Wait Time</div>
                            </div>
                        </div>
                    ))}

                    {waitingList.length === 0 && (
                        <div className="p-10 text-center text-slate-400 italic">
                            Queue is clear.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
