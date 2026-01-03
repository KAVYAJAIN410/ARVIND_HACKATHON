import { NextResponse } from 'next/server';
import { QueueSystem } from '../../../../lib/queueSystem';

export async function POST(request) {
    try {
        const { tokenId } = await request.json();

        if (!tokenId) {
            return NextResponse.json({ success: false, message: "Missing Token ID" }, { status: 400 });
        }

        const nextStation = QueueSystem.advancePatient(tokenId);

        return NextResponse.json({
            success: true,
            message: "Patient moved to next station",
            nextStation
        });

    } catch (error) {
        console.error("Queue Advance Error:", error);
        return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
    }
}
