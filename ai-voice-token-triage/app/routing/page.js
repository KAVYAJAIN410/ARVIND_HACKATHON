'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { playSuccessTone, playErrorTone } from '../../utils/soundUtils';

export default function StationRouting() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const complaint = decodeURIComponent(searchParams.get('complaint') || '');
  
  const [route, setRoute] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock routing rules
  const getRouteForCategory = (cat) => {
    const routes = {
      "OPD_GENERAL": [
        { id: 1, name: "Registration", estimatedTime: "2-3 min", load: 30 },
        { id: 2, name: "Vitals", estimatedTime: "3-4 min", load: 45 },
        { id: 3, name: "Doctor Consultation", estimatedTime: "10-15 min", load: 65 },
        { id: 4, name: "Pharmacy", estimatedTime: "5-7 min", load: 40 }
      ],
      "REFRACTION": [
        { id: 1, name: "Registration", estimatedTime: "2-3 min", load: 30 },
        { id: 2, name: "Refraction Test", estimatedTime: "15-20 min", load: 75 },
        { id: 3, name: "Doctor Consultation", estimatedTime: "10-15 min", load: 65 },
        { id: 4, name: "Optical Shop", estimatedTime: "10-15 min", load: 55 }
      ],
      "OPHTHALMOLOGY": [
        { id: 1, name: "Registration", estimatedTime: "2-3 min", load: 30 },
        { id: 2, name: "Triage", estimatedTime: "5-7 min", load: 50 },
        { id: 3, name: "Doctor Consultation", estimatedTime: "12-18 min", load: 80 },
        { id: 4, name: "Procedure Room", estimatedTime: "15-25 min", load: 35 },
        { id: 5, name: "Pharmacy", estimatedTime: "5-7 min", load: 40 }
      ],
      "GENERAL_CHECKUP": [
        { id: 1, name: "Registration", estimatedTime: "2-3 min", load: 30 },
        { id: 2, name: "Vitals", estimatedTime: "3-4 min", load: 45 },
        { id: 3, name: "Doctor Consultation", estimatedTime: "8-12 min", load: 55 }
      ],
      "EMERGENCY": [
        { id: 1, name: "Triage", estimatedTime: "Immediate", load: 95 },
        { id: 2, name: "Emergency Doctor", estimatedTime: "5-10 min", load: 85 },
        { id: 3, name: "Specialist Consultation", estimatedTime: "10-15 min", load: 70 }
      ],
      "GENERAL": [
        { id: 1, name: "Registration", estimatedTime: "2-3 min", load: 30 },
        { id: 2, name: "Triage", estimatedTime: "3-5 min", load: 45 },
        { id: 3, name: "Doctor Consultation", estimatedTime: "10-15 min", load: 60 }
      ]
    };
    
    // Return the route for the category or a default route
    return routes[cat] || routes["GENERAL"];
  };

  useEffect(() => {
    if (category) {
      // Simulate processing delay
      setTimeout(() => {
        try {
          const routeForCategory = getRouteForCategory(category);
          setRoute(routeForCategory);
          playSuccessTone(); // Play success sound
          setLoading(false);
        } catch (err) {
          setError('Error determining route');
          playErrorTone(); // Play error sound
          setLoading(false);
        }
      }, 1500);
    } else {
      // If no category in params, redirect back to complaint mapping
      router.push('/complaint-mapping');
    }
  }, [category, router]);

  const handleNext = () => {
    router.push(`/token-generation?category=${category}&complaint=${encodeURIComponent(complaint)}`);
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-700">No category provided</p>
          <button 
            onClick={() => router.push('/complaint-mapping')}
            className="mt-4 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-full"
          >
            Back to Complaint Mapping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-primary-700 mb-2">
          Your Recommended Route
        </h1>
        <p className="text-lg text-center text-gray-600 mb-8">Based on your complaint: "{complaint}"</p>
        
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-lg text-gray-600">Determining your route...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Route visualization */}
            <div className="space-y-4">
              {route.map((station, index) => (
                <div 
                  key={station.id} 
                  className={`flex items-center p-4 rounded-xl border ${
                    station.load > 80 ? 'bg-red-50 border-red-200' : 
                    station.load > 60 ? 'bg-yellow-50 border-yellow-200' : 
                    'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">{station.name}</h3>
                      <span className="text-sm font-medium bg-white px-2 py-1 rounded">
                        {station.estimatedTime}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          station.load > 80 ? 'bg-red-500' : 
                          station.load > 60 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`} 
                        style={{ width: `${station.load}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Current load: {station.load}% - {station.load > 80 ? 'High' : station.load > 60 ? 'Moderate' : 'Low'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Continue button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleNext}
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300"
              >
                Generate Token
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}