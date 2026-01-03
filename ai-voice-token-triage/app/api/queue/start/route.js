import { NextResponse } from 'next/server';
import { QueueSystem } from '../../../../lib/queueSystem';
import { db } from '../../../../lib/db';

export async function POST(request) {
    try {
        const data = await request.json();
        const { tokenId, esiLevel, patientId, category } = data;

        // Ensure Visit exists in DB
        let visit = db.getVisit(tokenId);
        if (!visit) {
            visit = db.createVisit({
                tokenId,
                patientId: patientId || "Unknown",
                esiLevel: esiLevel || 3,
                timestamp: new Date().toISOString(),
                category: category || "Unknown"
            });
        }

        // Start the Flow (Category takes precedence per new logic)
        QueueSystem.startJourney(tokenId, esiLevel, category);

        return NextResponse.json({ success: true, message: "Patient entered into queue" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
