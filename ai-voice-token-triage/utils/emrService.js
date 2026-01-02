// Mock EMR Integration Service
export const mockEMRService = {
  // Simulate pushing complaint and token data to EMR
  pushToEMR: async (tokenData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    return {
      success,
      message: success ? 'Successfully synced to EMR' : 'Failed to sync to EMR',
      emrId: success ? `EMR-${Date.now()}` : null,
      timestamp: new Date().toISOString()
    };
  },
  
  // Simulate pulling doctor availability
  pullDoctorAvailability: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const doctors = [
      { id: 1, name: 'Dr. Senthil Kumar', specialty: 'General Ophthalmology', available: true },
      { id: 2, name: 'Dr. Priya Sharma', specialty: 'Refraction', available: true },
      { id: 3, name: 'Dr. Rajesh Menon', specialty: 'Ophthalmology', available: false },
      { id: 4, name: 'Dr. Anitha Nair', specialty: 'Pediatric Ophthalmology', available: true },
      { id: 5, name: 'Dr. Vijay Raj', specialty: 'Retina Specialist', available: true },
    ];
    
    return {
      success: true,
      doctors,
      timestamp: new Date().toISOString()
    };
  },
  
  // Simulate getting EMR sync status
  getSyncStatus: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      connected: true,
      lastSync: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      syncCount: 42,
      successRate: 95.2
    };
  }
};