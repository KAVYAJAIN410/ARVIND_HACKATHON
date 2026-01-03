import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function POST(request) {
    try {
        const body = await request.json();

        // Basic Validation
        if (!body.name || !body.age) {
            return NextResponse.json({ success: false, message: "Name and Age are required" }, { status: 400 });
        }

        const newPatient = {
            id: body.id, // optional, will be generated if missing
            name: body.name,
            age: body.age,
            gender: body.gender || 'Unknown',
            phone: body.phone || '',
            history: {
                diabetes: false,
                glaucoma: false,
                hypertension: false,
                ...body.history // Allow passing initial history if needed
            },
            registeredAt: new Date().toISOString()
        };

        const savedPatient = db.createPatient(newPatient);

        return NextResponse.json({
            success: true,
            message: "Patient Registered Successfully",
            patient: savedPatient
        });

    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
