import { NextResponse } from 'next/server';

// In-memory store (Simulating Database)
// Note: This will reset on server restart, which is fine for a demo.
let patientQueue = [
  {
    token: 'AEH-101',
    name: 'Anonymous (Kiosk)',
    complaint: 'Red eye with severe pain',
    category: 'OPHTHALMOLOGY',
    severity: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    status: 'waiting'
  },
  {
    token: 'AEH-102',
    name: 'Anonymous (Kiosk)',
    complaint: 'Need new glasses',
    category: 'REFRACTION',
    severity: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    status: 'in_progress'
  }
];

export async function GET() {
  return NextResponse.json(patientQueue);
}

export async function POST(request) {
  try {
    const data = await request.json();

    const newEntry = {
      token: data.tokenId,
      name: 'Anonymous (Kiosk)',
      complaint: data.complaint || 'Unspecified',
      category: data.category,
      severity: 'low', // default
      timestamp: new Date().toISOString(),
      status: 'waiting',
      ...data // override with provided data
    };

    patientQueue.unshift(newEntry); // Add to top
    return NextResponse.json({ success: true, entry: newEntry });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add entry' }, { status: 500 });
  }
}