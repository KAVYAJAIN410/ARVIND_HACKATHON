'use client';

import { useState, useEffect } from 'react';
import VoiceRecorder from '../components/VoiceRecorder';
import RegistrationModal from '../components/RegistrationModal'; // New Import
import { resetDemoData } from '../lib/demoUtils';
import { ShieldCheckIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function KioskPage() {
  const [language, setLanguage] = useState('ta'); // Default to Tamil
  const [mounted, setMounted] = useState(false);

  // Registration State
  const [showRegistration, setShowRegistration] = useState(true); // Start with Registration
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    setMounted(true);
    // Clear previous session on load
    localStorage.removeItem('current_patient');
  }, []);

  const handleRegistrationComplete = (patientData) => {
    console.log("Patient Registered:", patientData);
    setPatient(patientData);
    setShowRegistration(false); // Hide modal

    // Persist for next pages
    localStorage.setItem('current_patient', JSON.stringify(patientData));
  };

  // Standardized Professional Translations
  const translations = {
    ta: {
      hospital_name: "அரவிந்த் கண் மருத்துவமனை",
      department: "வெளி நோயாளிகள் பிரிவு - பதிவு",
      welcome: "வணக்கம்",
      action_title: "உங்கள் வருகையை பதிவு செய்யவும்", // Changed
      action_desc: "தொடங்குவதற்கு உங்கள் விவரங்களை பதிவு செய்யவும்.", // Changed
      btn_start: "பதிவு செய்ய",
      btn_reset: "மீட்டமை",
      status_online: "அமைப்பு செயல்பாட்டில் உள்ளது",
      greeting: "வணக்கம்"
    },
    en: {
      hospital_name: "Aravind Eye Hospital",
      department: "OPD Registration Kiosk",
      welcome: "Welcome",
      action_title: "Register Your Visit", // Changed
      action_desc: "Please register your details to begin the triage process.", // Changed
      btn_start: "Start Registration",
      btn_reset: "Reset System",
      status_online: "System Online",
      greeting: "Hello"
    }
  };

  const t = translations[language];

  // SVG Icons as components to avoid dependency issues if heroicons is missing
  const IconMicrophone = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 1.5a6 6 0 00-6 6v1.5a6 6 0 006 6 6 6 0 006-6v-1.5a6 6 0 00-6-6z" />
    </svg>
  );

  const IconGlobe = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 01-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m-14.34 0A8.959 8.959 0 013 12c0-.778.099-1.533.284-2.253m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918" />
    </svg>
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">

      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="hospital-container py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-sky-600 rounded flex items-center justify-center text-white font-bold text-xl">A</div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{t.hospital_name}</h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.department}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              {t.status_online}
            </div>
            <button
              onClick={() => setLanguage(language === 'ta' ? 'en' : 'ta')}
              className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              <IconGlobe />
              {language === 'ta' ? 'English' : 'தமிழ்'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 relative">

        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">

          {/* Left: Instructions & Context */}
          <div className="space-y-8 text-center md:text-left">
            <div>
              <span className="text-sky-600 font-bold tracking-wide uppercase text-sm mb-2 block">{t.welcome}</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                {patient ? `${t.greeting}, ${patient.name}` : t.action_title}
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                {patient
                  ? (language === 'ta' ? "இப்போது உங்கள் கண் பிரச்சனையை பேசுங்கள்." : "Please speak about your eye problem now.")
                  : t.action_desc
                }
              </p>
            </div>

            <div className="hidden md:grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                <div className="font-semibold text-slate-900 mb-1">AI Powered</div>
                <div className="text-sm text-slate-500">Instant triage & token generation</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                <div className="font-semibold text-slate-900 mb-1">Fast Track</div>
                <div className="text-sm text-slate-500">Reduced waiting times</div>
              </div>
            </div>
          </div>

          {/* Right: Interaction Zone */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative">

              {/* Conditional Rendering: Registration vs Voice */}
              {!patient ? (
                <button
                  onClick={() => setShowRegistration(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-8 px-12 rounded-3xl shadow-xl flex flex-col items-center gap-4 transition-transform hover:scale-105"
                >
                  <UserGroupIcon className="w-16 h-16" />
                  <span className="text-xl">{t.btn_start}</span>
                </button>
              ) : (
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center gap-6 w-full max-w-sm mx-auto transition-all hover:shadow-2xl animate-fade-in-up">
                  <VoiceRecorder language={language} patientHistory={patient?.history} />
                  <p className="text-sm text-slate-400 font-medium text-center max-w-[200px]">
                    {language === 'ta' ? "பேசிய பிறகு தானாகவே செயல்முறை தொடங்கும்" : "Auto-processing starts after speech"}
                  </p>
                </div>
              )}

              {/* Decorative background circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl -z-10 opacity-60"></div>
            </div>
          </div>

        </div>

      </main>

      {/* Registration Modal - Conditionally Rendered */}
      {showRegistration && !patient && (
        <RegistrationModal onComplete={handleRegistrationComplete} />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="hospital-container flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>© 2025 Aravind Eye Hospital. All rights reserved.</p>
          <button onClick={() => {
            resetDemoData();
            setPatient(null);
            localStorage.removeItem('current_patient');
            setShowRegistration(true);
          }} className="mt-2 md:mt-0 px-3 py-1 text-xs font-semibold bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded border border-slate-200 hover:border-red-200 transition-colors uppercase">
            {t.btn_reset}
          </button>
        </div>
      </footer>

    </div>
  );
}