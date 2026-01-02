'use client';

import { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [tokens, setTokens] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [emrStatus, setEmrStatus] = useState({ connected: false, lastSync: null, syncCount: 0, successRate: 0 });

  // Mock data initialization
  useEffect(() => {
    // Simulate loading data
    setTimeout(async () => {
      const mockTokens = [
        { id: 'A-101', complaint: 'Eye irritation', category: 'OPD_GENERAL', status: 'completed', timestamp: '2023-06-01T09:00:00Z', station: 'Registration' },
        { id: 'A-102', complaint: 'Blurred vision', category: 'REFRACTION', status: 'in-progress', timestamp: '2023-06-01T09:15:00Z', station: 'Refraction Test' },
        { id: 'A-103', complaint: 'Eye pain', category: 'OPHTHALMOLOGY', status: 'waiting', timestamp: '2023-06-01T09:30:00Z', station: 'Registration' },
        { id: 'A-104', complaint: 'Routine checkup', category: 'GENERAL_CHECKUP', status: 'completed', timestamp: '2023-06-01T09:45:00Z', station: 'Consultation' },
        { id: 'A-105', complaint: 'Eye irritation', category: 'OPD_GENERAL', status: 'waiting', timestamp: '2023-06-01T10:00:00Z', station: 'Registration' },
        { id: 'A-106', complaint: 'Blurred vision', category: 'REFRACTION', status: 'in-progress', timestamp: '2023-06-01T10:15:00Z', station: 'Doctor Consultation' },
        { id: 'A-107', complaint: 'Eye pain', category: 'OPHTHALMOLOGY', status: 'waiting', timestamp: '2023-06-01T10:30:00Z', station: 'Triage' },
        { id: 'A-108', complaint: 'Routine checkup', category: 'GENERAL_CHECKUP', status: 'completed', timestamp: '2023-06-01T10:45:00Z', station: 'Consultation' },
      ];

      const mockStations = [
        { name: 'Registration', load: 45, waitTime: 12, queue: 8 },
        { name: 'Vitals', load: 60, waitTime: 15, queue: 12 },
        { name: 'Doctor Consultation', load: 75, waitTime: 18, queue: 15 },
        { name: 'Refraction Test', load: 85, waitTime: 22, queue: 18 },
        { name: 'Pharmacy', load: 35, waitTime: 8, queue: 6 },
        { name: 'Triage', load: 55, waitTime: 10, queue: 9 },
        { name: 'Procedure Room', load: 25, waitTime: 5, queue: 3 },
      ];
      
      setTokens(mockTokens);
      setStations(mockStations);
      
      // Fetch EMR status
      await fetchEMRStatus();
      setLoading(false);
    }, 1000);
  }, []);

  // Fetch EMR status
  const fetchEMRStatus = async () => {
    try {
      const response = await fetch('/api/emr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getSyncStatus'
        })
      });
      
      const result = await response.json();
      setEmrStatus(result);
    } catch (error) {
      console.error('Error fetching EMR status:', error);
      setEmrStatus({ connected: false, lastSync: null, syncCount: 0, successRate: 0 });
    }
  };

  // Chart data
  const stationLoadData = {
    labels: stations.map(station => station.name),
    datasets: [
      {
        label: 'Station Load (%)',
        data: stations.map(station => station.load),
        backgroundColor: stations.map(station => 
          station.load > 80 ? '#ef4444' : // red for high load
          station.load > 60 ? '#f59e0b' : // yellow for medium load
          '#10b981' // green for low load
        ),
      },
    ],
  };

  const categoryDistributionData = {
    labels: ['OPD General', 'Refraction', 'Ophthalmology', 'General Checkup', 'Emergency'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#8b5cf6',
          '#f59e0b',
          '#ef4444'
        ],
      },
    ],
  };

  const waitingTimeData = {
    labels: ['Registration', 'Vitals', 'Consultation', 'Refraction', 'Pharmacy'],
    datasets: [
      {
        label: 'Average Wait Time (min)',
        data: [12, 15, 18, 22, 8],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const stationStatusCounts = tokens.reduce((acc, token) => {
    const station = token.station;
    if (!acc[station]) acc[station] = { waiting: 0, inProgress: 0, completed: 0 };
    
    if (token.status === 'waiting') acc[station].waiting++;
    else if (token.status === 'in-progress') acc[station].inProgress++;
    else if (token.status === 'completed') acc[station].completed++;
    
    return acc;
  }, {});

  const filteredTokens = selectedStation === 'all' 
    ? tokens 
    : tokens.filter(token => token.station === selectedStation);

  const statusCounts = {
    waiting: tokens.filter(t => t.status === 'waiting').length,
    inProgress: tokens.filter(t => t.status === 'in-progress').length,
    completed: tokens.filter(t => t.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-medium text-gray-500">Total Tokens</h3>
            <p className="text-3xl font-bold text-gray-900">{tokens.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-medium text-gray-500">Waiting</h3>
            <p className="text-3xl font-bold text-yellow-600">{statusCounts.waiting}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-medium text-gray-500">In Progress</h3>
            <p className="text-3xl font-bold text-blue-600">{statusCounts.inProgress}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-medium text-gray-500">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{statusCounts.completed}</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Station Load Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Station Load</h2>
            <Bar 
              data={stationLoadData} 
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                },
                scales: {
                  y: { min: 0, max: 100, title: { display: true, text: 'Load (%)' } },
                },
              }}
            />
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Complaint Category Distribution</h2>
            <Doughnut 
              data={categoryDistributionData} 
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'right' },
                },
              }}
            />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Average Wait Time */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Average Wait Time by Station</h2>
            <Line 
              data={waitingTimeData} 
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Wait Time (minutes)' },
                },
                scales: {
                  y: { title: { display: true, text: 'Minutes' } },
                },
              }}
            />
          </div>

          {/* Station Status */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Tokens by Station</h2>
            <div className="space-y-4">
              {Object.entries(stationStatusCounts).map(([station, counts]) => (
                <div key={station} className="border-b border-gray-200 pb-3 last:border-0">
                  <h3 className="font-medium text-gray-800">{station}</h3>
                  <div className="flex space-x-6 mt-2">
                    <div>
                      <span className="text-yellow-600 font-medium">Waiting: {counts.waiting}</span>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">In Progress: {counts.inProgress}</span>
                    </div>
                    <div>
                      <span className="text-green-600 font-medium">Completed: {counts.completed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Token List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Recent Tokens</h2>
            <select 
              value={selectedStation} 
              onChange={(e) => setSelectedStation(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Stations</option>
              {stations.map(station => (
                <option key={station.name} value={station.name}>{station.name}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTokens.map((token) => (
                  <tr key={token.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{token.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{token.complaint}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${token.category === 'OPD_GENERAL' ? 'bg-blue-100 text-blue-800' :
                          token.category === 'REFRACTION' ? 'bg-green-100 text-green-800' :
                          token.category === 'OPHTHALMOLOGY' ? 'bg-purple-100 text-purple-800' :
                          token.category === 'GENERAL_CHECKUP' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}
                      >
                        {token.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{token.station}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(token.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${token.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          token.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'}`}
                      >
                        {token.status.charAt(0).toUpperCase() + token.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* EMR Integration Status */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Auroitech – Eyenotes (Mock API)</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Connection Status</p>
              <div className="flex items-center mt-1">
                <div className={`w-3 h-3 rounded-full mr-2 ${emrStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">{emrStatus.connected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Last Sync</p>
              <p className="font-medium">
                {emrStatus.lastSync ? new Date(emrStatus.lastSync).toLocaleTimeString() : 'Never'}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Sync Count</p>
              <p className="font-medium">{emrStatus.syncCount}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="font-medium">{emrStatus.successRate}%</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={fetchEMRStatus}
              className="bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-2 px-4 rounded-md"
            >
              Refresh Status
            </button>
          </div>
        </div>

        {/* Manual Override Section */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Manual Override Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Token ID</label>
              <input 
                type="text" 
                placeholder="A-101" 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="waiting">Waiting</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md">
                Update Status
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}