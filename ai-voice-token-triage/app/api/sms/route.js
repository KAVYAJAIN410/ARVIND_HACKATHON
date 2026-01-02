import { NextResponse } from 'next/server';
import { sendMockSMS } from '../../../utils/smsService';

export async function POST(request) {
  try {
    const { phoneNumber, message } = await request.json();
    
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }
    
    const result = await sendMockSMS(phoneNumber, message);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('SMS sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS', message: error.message },
      { status: 500 }
    );
  }
}