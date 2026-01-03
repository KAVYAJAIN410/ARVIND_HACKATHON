'use client';

import { QRCodeCanvas } from 'qrcode.react';
// Using qrcode.react which is the standard React wrapper, 
// wait, I installed 'qrcode'. Let me check usage for 'qrcode' package in React.
// Actually standard 'qrcode' is for node/browser JS. 
// For simpler React usage, I should have installed 'qrcode.react' or just use 'qrcode' to generate data URL.
// I will use 'qrcode' to generate a data URL string.

import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

export default function DigitalTicket({ tokenData }) {
    const [qrSrc, setQrSrc] = useState('');

    useEffect(() => {
        // Generate QR Data URL
        const generateQR = async () => {
            try {
                // Generate Full URL for Patient Companion App
                // Using detected LAN IP to allow mobile scanning
                const baseUrl = "http://10.196.237.96:3000";
                const qrUrl = `${baseUrl}/patient/${tokenData.tokenId}`;

                const qr = await QRCode.toDataURL(qrUrl, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                });
                setQrSrc(qr);
            } catch (err) {
                console.error(err);
            }
        };
        generateQR();
    }, [tokenData]);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full mx-auto relative overflow-hidden print:shadow-none print:border-2 print:border-black">

            {/* Cutout Circles for Ticket Look */}
            <div className="absolute -left-3 top-1/2 w-6 h-6 bg-slate-50 rounded-full"></div>
            <div className="absolute -right-3 top-1/2 w-6 h-6 bg-slate-50 rounded-full"></div>

            <div className="text-center border-b-2 border-dashed border-slate-200 pb-6 mb-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aravind Eye Hospital</h2>

                {/* ESI Stripe */}
                <div className={`w-full h-1 mt-2 mb-1 rounded-full ${tokenData.category === 'EMERGENCY' ? 'bg-red-500' :
                    tokenData.category === 'OPHTHALMOLOGY' ? 'bg-orange-500' :
                        'bg-green-500'
                    }`}></div>

                <h1 className="text-3xl font-black text-slate-800 mt-2">TOKEN</h1>
                <div className={`text-5xl font-black my-4 tracking-tighter ${tokenData.category === 'EMERGENCY' ? 'text-red-600' :
                    tokenData.category === 'OPHTHALMOLOGY' ? 'text-orange-600' :
                        'text-emerald-600'
                    }`}>
                    {tokenData.tokenId}
                </div>
                <div className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded text-xs font-bold uppercase">
                    {tokenData.category.replace('_', ' ')}
                </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
                {qrSrc ? (
                    <img src={qrSrc} alt="Token QR" className="w-32 h-32 border-4 border-white shadow-sm" />
                ) : (
                    <div className="w-32 h-32 bg-slate-100 animate-pulse rounded"></div>
                )}

                <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Estimated Wait Time</p>
                    <p className="text-2xl font-bold text-slate-700">{tokenData.waitTime} mins</p>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 uppercase">Please show this at Counter {tokenData.counter}</p>
                <p className="text-[10px] text-slate-300 mt-1">{new Date().toLocaleString()}</p>
            </div>
        </div>
    );
}
