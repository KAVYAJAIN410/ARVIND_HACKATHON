'use client';

import { useState } from 'react';
import OCRScanner from './OCRScanner';

export default function RegistrationModal({ onComplete }) {
    const [mode, setMode] = useState('new'); // 'new' or 'existing'
    const [showScanner, setShowScanner] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        phone: ''
    });

    const [existingPhone, setExistingPhone] = useState('');

    // Enhanced Parsing Logic for ID Cards (Aadhaar/License) with Multi-Lingual Support
    const handleScan = (data) => {
        setShowScanner(false);
        const rawText = data.rawText;
        console.log("Parsing ID Proof:", rawText);

        let newDetails = { ...formData };

        // 1. Name Parsing (Context-Aware & Multi-Lingual Strategy)
        const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
        const ignoreWords = ['GOVERNMENT', 'INDIA', 'CARD', 'DOB', 'MALE', 'FEMALE', 'UIDAI', 'YEAR', 'YOB', 'DATE', 'ADDRESS', 'FATHER', 'DISTRICT', 'STATE', 'HUS', 'WIFE', 'DAUGHTER', 'SON'];

        let nameFound = false;

        // Strategy A: Look for "Name" prefix (Explicit label)
        for (let line of lines) {
            const match = line.match(/Name\s*[:|-]?\s*([A-Za-z\s\.]+)/i);
            if (match && match[1].length > 3) {
                newDetails.name = match[1].trim();
                nameFound = true;
                break;
            }
        }

        // Strategy B: Contextual Anchoring (Name is usually above DOB or Gender)
        if (!nameFound) {
            // Find line index of DOB or Gender
            const anchorIndex = lines.findIndex(l =>
                /(DOB|Year|YOB|Male|Female|Gender|Ex|Dt|Date)/i.test(l) || /\d{2}\/\d{2}\/\d{4}/.test(l)
            );

            if (anchorIndex > 0) {
                // Look at the line immediately before the anchor
                // We go backwards from anchor
                for (let i = anchorIndex - 1; i >= 0; i--) {
                    const candidate = lines[i];
                    const cleanCandidate = candidate.replace(/[^a-zA-Z\s\.]/g, '').trim(); // Remove symbols/Tamil chars for name check

                    // If line is just "Father Name", skip it
                    if (/(Father|Parent|Mother|Husband)/i.test(candidate)) continue;

                    // Check if line has enough English characters (detects "Name" vs "Tamil Name")
                    const englishCharCount = (candidate.match(/[A-Za-z]/g) || []).length;
                    if (englishCharCount < 3) continue; // Skip lines that are mostly symbols or Tamil

                    if (cleanCandidate.length > 3 &&
                        !ignoreWords.some(w => cleanCandidate.toUpperCase().includes(w)) &&
                        !/^\d+$/.test(candidate) // Ensure not pure number
                    ) {
                        newDetails.name = cleanCandidate;
                        nameFound = true;
                        break;
                    }
                }
            }
        }

        // Strategy C: Fallback to first clean English text line
        if (!nameFound) {
            for (let line of lines) {
                const cleanLine = line.replace(/[^a-zA-Z\s\.]/g, '').trim();
                const upperLine = cleanLine.toUpperCase();

                // Language Check
                const englishCharCount = (line.match(/[A-Za-z]/g) || []).length;
                if (englishCharCount < 3) continue;

                if (cleanLine.length < 3) continue;
                if (ignoreWords.some(w => upperLine.includes(w))) continue;
                if (/\d/.test(line)) continue;

                newDetails.name = cleanLine;
                break;
            }
        }

        // 2. Gender Parsing
        if (rawText.match(/FEMALE/i) || rawText.match(/\/ F /i)) newDetails.gender = 'Female';
        else if (rawText.match(/MALE/i) || rawText.match(/\/ M /i)) newDetails.gender = 'Male';

        // 3. Age/DOB Parsing
        const yearMatch = rawText.match(/(19|20)\d{2}/);
        if (yearMatch) {
            const year = parseInt(yearMatch[0]);
            const currentYear = new Date().getFullYear();
            if (year > 1900 && year <= currentYear) {
                newDetails.age = (currentYear - year).toString();
            }
        }

        setFormData(newDetails);

        // Show user what we found (Debug/Confirmation)
        alert(`OCR Result:\nName: ${newDetails.name || "Unknown"}\nAge: ${newDetails.age || "Unknown"}\nGender: ${newDetails.gender}\n\n(Edit manually if incorrect)`);
    };

    const handleSubmitNew = (e) => {
        e.preventDefault();
        if (!formData.name) return alert("Please enter name");
        if (!formData.age) return alert("Please enter age");

        // Pass data back
        onComplete({
            type: 'new',
            ...formData,
            isGuest: false
        });
    };

    const handleSubmitExisting = async (e) => {
        e.preventDefault();
        if (!existingPhone || existingPhone.length < 10) return alert("Please enter a valid phone number");

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: existingPhone })
            });

            const data = await response.json();

            if (data.success) {
                onComplete({
                    type: 'existing',
                    ...data.patient, // Includes history
                    isGuest: false
                });
            } else {
                alert("Patient not found! Please register as New.");
            }
        } catch (err) {
            console.error(err);
            alert("Login failed");
        }
    };

    const handleGuest = () => {
        onComplete({
            type: 'guest',
            name: 'Anonymous Guest',
            isGuest: true
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 font-sans">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">

                {/* Header */}
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Welcome to Aravind</h2>
                        <p className="text-sm text-slate-500">Please identify yourself</p>
                    </div>
                    <button onClick={handleGuest} className="text-xs text-slate-400 hover:text-slate-600 underline">
                        Skip (Guest)
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 bg-slate-50 gap-2">
                    <button
                        onClick={() => setMode('new')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'new' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:bg-slate-200'
                            }`}
                    >
                        New Registration
                    </button>
                    <button
                        onClick={() => setMode('existing')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'existing' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:bg-slate-200'
                            }`}
                    >
                        Existing User
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6">
                    {mode === 'new' ? (
                        <div className="space-y-6">

                            {/* ID Scan Option */}
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-blue-800 text-sm">Have an ID Proof?</div>
                                    <div className="text-xs text-blue-600">Scan Aadhaar/Voter ID to auto-fill</div>
                                </div>
                                <button
                                    onClick={() => setShowScanner(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow transition-colors flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                    </svg>
                                    Scan ID
                                </button>
                            </div>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-slate-200"></div>
                                <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase">OR Enter Manually</span>
                                <div className="flex-grow border-t border-slate-200"></div>
                            </div>

                            <form onSubmit={handleSubmitNew} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">FULL NAME</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. Ramanathan S"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">AGE</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="25"
                                            value={formData.age}
                                            onChange={e => setFormData({ ...formData, age: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">GENDER</label>
                                        <select
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.gender}
                                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                        >
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">PHONE NUMBER (Optional)</label>
                                    <input
                                        type="tel"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="9876543210"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all mt-4"
                                >
                                    Register & Start
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">

                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-4">
                                <p className="text-sm text-emerald-800">
                                    Welcome back! Enter your registered phone number to pull up your records.
                                </p>
                            </div>

                            <form onSubmit={handleSubmitExisting} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">REGISTERED PHONE NUMBER</label>
                                    <input
                                        type="tel"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg tracking-widest"
                                        placeholder="98765 43210"
                                        value={existingPhone}
                                        onChange={e => setExistingPhone(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all"
                                >
                                    Login
                                </button>

                                <div className="text-xs text-slate-400 text-center mt-2">
                                    Try: 9876543210 (Glaucoma), 9988776655 (One-Eyed)
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {showScanner && (
                <OCRScanner
                    onScan={handleScan}
                    onCancel={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}
