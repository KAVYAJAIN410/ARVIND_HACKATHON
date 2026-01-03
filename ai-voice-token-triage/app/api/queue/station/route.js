import { NextResponse } from 'next/server';
import { QueueSystem } from '../../../../lib/queueSystem';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const station = searchParams.get('id');

        if (!station) {
            return NextResponse.json({ error: "Station ID required" }, { status: 400 });
        }

        const queue = QueueSystem.getStationQueue(station);

        return NextResponse.json({
            station,
            queue,
            count: queue.length,
            nextPatient: queue.length > 0 ? queue[0] : null
        });
    } catch (error) {
        console.error("Station API Error:", error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
