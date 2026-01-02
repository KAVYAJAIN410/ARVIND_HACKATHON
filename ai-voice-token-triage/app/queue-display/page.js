'use client';

import { useState, useEffect } from 'react';

export default function QueueDisplay() {
  const [stationName, setStationName] = useState('OPD Registration');
  const [currentToken, setCurrentToken] = useState(null);
  const [nextTokens, setNextTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate real-time queue data
  useEffect(() => {
    // Initial load
    updateQueueData();
    
    // Update every 5 seconds
    const interval = setInterval(updateQueueData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const updateQueueData = () => {
    // Generate mock queue data
    const allTokens = Array.from({ length: 50 }, (_, i) => ({
      id: `A-${100 + i}`,
      timestamp: new Date(Date.now() - Math.random() * 1200000).toISOString(), // Random time in last 20 mins
      category: ['OPD_GENERAL', 'REFRACTION', 'OPHTHALMOLOGY', 'GENERAL_CHECKUP'][Math.floor(Math.random() * 4)]
    }));

    // Get current token (first in queue)
    const current = allTokens[Math.floor(Math.random() * 10)];
    
    // Get next 5 tokens
    const next = allTokens
      .filter(token => token.id !== current.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
    
    setCurrentToken(current);
    setNextTokens(next);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-primary-400 mb-4">{stationName}</h1>
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-4xl">Loading queue data...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Token */}
            <div className="lg:col-span-2 bg-gradient-to-br from-red-700 to-red-900 rounded-2xl p-8 shadow-2xl">
              <div className="text-center">
                <h2 className="text-3xl font-semibold mb-6 text-red-200">Currently Serving</h2>
                {currentToken && (
                  <div className="bg-black bg-opacity-30 rounded-xl p-12">
                    <div className="text-8xl font-bold text-white mb-4">{currentToken.id}</div>
                    <div className="text-2xl text-red-300">Please proceed to counter</div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Tokens */}
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-semibold mb-6 text-center text-blue-300">Next Tokens</h2>
              <div className="space-y-6">
                {nextTokens.map((token, index) => (
                  <div 
                    key={index} 
                    className={`flex justify-between items-center p-4 rounded-lg ${
                      index === 0 ? 'bg-yellow-900 bg-opacity-50 border-2 border-yellow-500' : 
                      index === 1 ? 'bg-blue-900 bg-opacity-50' : 
                      'bg-gray-700 bg-opacity-50'
                    }`}
                  >
                    <div className="text-3xl font-bold text-white">#{index + 1}</div>
                    <div className="text-5xl font-bold text-white">{token.id}</div>
                    <div className="text-xl text-gray-300">{token.category}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-xl text-gray-400">
          Aravind Eye Hospital - Thanjavur | {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}