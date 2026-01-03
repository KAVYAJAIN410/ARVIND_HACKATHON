import { NextResponse } from 'next/server';
import { QueueSystem } from '../../../lib/queueSystem';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('tokenId');

    if (!tokenId) {
        return NextResponse.json({ error: "Token ID required" }, { status: 400 });
    }

    try {
        const status = QueueSystem.getPatientStatus(tokenId);

        if (!status) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        return NextResponse.json(status);
    } catch (error) {
        console.error("Status check failed", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
