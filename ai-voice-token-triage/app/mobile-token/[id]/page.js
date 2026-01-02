'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';

export default function MobileToken() {
  const { id } = useParams();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStation, setCurrentStation] = useState(0);

  useEffect(() => {
    if (id) {
      // Simulate fetching token details
      setTimeout(() => {
        try {
          // Mock token data based on the token ID
          const mockToken = {
            id: id,
            complaint: "Eye irritation and redness",
            category: "OPD_GENERAL",
            assignedDoctor: "Dr. Senthil Kumar",
            stationList: [
              { id: 1, name: "Registration", completed: true },
              { id: 2, name: "Vitals", completed: true },
              { id: 3, name: "Doctor Consultation", completed: false },
              { id: 4, name: "Pharmacy", completed: false }
            ],
            queuePosition: Math.floor(Math.random() * 5) + 1, // Mock position between 1-5
            estimatedWaitTime: 15, // minutes
            timestamp: new Date().toISOString()
          };
          
          setToken(mockToken);
          
          // Determine current station based on completed status
          const currentIndex = mockToken.stationList.findIndex(station => !station.completed);
          setCurrentStation(currentIndex !== -1 ? currentIndex : mockToken.stationList.length);
          
          setLoading(false);
        } catch (err) {
          setError('Error loading token details');
          setLoading(false);
        }
      }, 1000);
    }
  }, [id]);

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-gray-700">Invalid token ID</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hospital-bg p-4">
      <div className="mobile-token-container">
        {/* Header */}
        <div className="mobile-token-header">
          <h1 className="text-xl font-bold text-white">Your Token</h1>
          <div className="mobile-token-number">{token?.id || 'A-XXX'}</div>
        </div>

        {loading ? (
          <div className="p-8 flex flex-col items-center">
            <div className="loading-spinner mb-4"></div>
            <p className="text-lg text-gray-600">Loading token details...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-100 text-red-700">
            {error}
          </div>
        ) : token && (
          <div className="p-6">
            {/* Complaint and Category */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Complaint:</p>
                  <p className="font-medium text-gray-800">{token.complaint}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Category:</p>
                  <p className="font-medium text-gray-800">{token.category}</p>
                </div>
              </div>
            </div>

            {/* Queue Status */}
            <div className="bg-blue-100 border border-blue-200 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-center text-blue-800 mb-2">Queue Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-gray-700">Position</p>
                  <p className="text-2xl font-bold text-blue-700">#{token.queuePosition}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-700">Wait Time</p>
                  <p className="text-2xl font-bold text-blue-700">{token.estimatedWaitTime} min</p>
                </div>
              </div>
            </div>

            {/* Current Station */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3 text-center">Current Station</h3>
              <div className="hospital-card bg-gradient-to-r from-green-100 to-blue-100 border-green-300">
                <div className="flex items-center justify-center py-4">
                  <div className="bg-[rgb(var(--hospital-green))] rounded-full w-12 h-12 flex items-center justify-center text-white mr-3">
                    <span className="font-bold text-lg">{currentStation + 1}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[rgb(var(--hospital-green-dark))] text-lg">
                      {token.stationList[currentStation]?.name || 'Registration'}
                    </p>
                    <p className="text-green-600 font-medium">Now Serving</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Stations */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3 text-center">Upcoming Stations</h3>
              <div className="space-y-3">
                {token.stationList
                  .filter((_, index) => index > currentStation)
                  .map((station, index) => (
                    <div 
                      key={station.id} 
                      className="hospital-card flex items-center p-3"
                    >
                      <div className="bg-[rgb(var(--hospital-blue))] rounded-full w-8 h-8 flex items-center justify-center text-white mr-3">
                        <span className="font-bold">{currentStation + 1 + index + 1}</span>
                      </div>
                      <p className="font-medium text-gray-800">{station.name}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Status Indicators */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3 text-center">Journey Status</h3>
              <div className="grid grid-cols-4 gap-2">
                {token.stationList.map((station, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${
                      index < currentStation ? 'bg-[rgb(var(--hospital-green))]' : 
                      index === currentStation ? 'bg-[rgb(var(--hospital-yellow))]' : 
                      'bg-gray-200'
                    }`}>
                      {index < currentStation ? (
                        <span className="text-white font-bold">✓</span>
                      ) : index === currentStation ? (
                        <span className="text-white font-bold">●</span>
                      ) : (
                        <span className="text-gray-600 font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 truncate">{station.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center py-4">
              <div className="bg-white p-4 rounded-lg border-2 border-[rgb(var(--hospital-blue))]">
                <QRCodeCanvas 
                  value={`${window.location.origin}/mobile-token/${id}`} 
                  size={150} 
                  bgColor="#ffffff"
                  fgColor="#0259d2"
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="mt-3 text-sm text-gray-600 font-medium">Show this QR code at stations</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-[rgb(var(--hospital-blue))] text-white p-4 text-center text-sm">
          Aravind Eye Hospital - Thanjavur
        </div>
      </div>
    </div>
  );
}