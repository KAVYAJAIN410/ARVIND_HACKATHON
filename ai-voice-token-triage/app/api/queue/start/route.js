import { NextResponse } from 'next/server';
import { QueueSystem } from '../../../../lib/queueSystem';
import { db } from '../../../../lib/db';

export async function POST(request) {
    try {
        const data = await request.json();
        const { tokenId, esiLevel, patientId } = data;

        // Ensure Visit exists in DB
        let visit = db.getVisit(tokenId);
        if (!visit) {
            visit = db.createVisit({
                tokenId,
                patientId: patientId || "Unknown",
                esiLevel: esiLevel || 3,
                timestamp: new Date().toISOString()
            });
        }

        // Start the Flow
        QueueSystem.startJourney(tokenId, esiLevel);

        return NextResponse.json({ success: true, message: "Patient entered into queue" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
