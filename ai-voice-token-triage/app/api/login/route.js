import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function POST(request) {
    try {
        const { phone } = await request.json();
        const patient = db.getPatientByPhone(phone);

        if (patient) {
            return NextResponse.json({ success: true, patient });
        } else {
            return NextResponse.json({ success: false, message: "Patient not found" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
    }
}
