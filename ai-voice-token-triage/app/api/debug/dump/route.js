import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
    return NextResponse.json({
        visits: db.getAllVisits(),
        queues: db.getQueues(),
        // Also dump pathways for verification
        // (We can't import pathways easily here if they aren't in db, but db state is crucial)
    });
}
