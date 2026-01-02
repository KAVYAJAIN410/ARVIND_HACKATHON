// SMS Notification Utility
export const sendMockSMS = async (phoneNumber, message) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real application, this would connect to an SMS service like Twilio
  console.log(`SMS sent to ${phoneNumber}: ${message}`);
  
  // Return success response
  return {
    success: true,
    messageId: `sms_${Date.now()}`,
    phoneNumber,
    message,
    timestamp: new Date().toISOString()
  };
};

// Mock phone numbers for demo
export const mockPhoneNumbers = [
  '+1234567890',
  '+1987654321',
  '+1555123456',
  '+1555987654',
  '+1555456789'
];