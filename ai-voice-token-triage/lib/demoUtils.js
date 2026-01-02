// Demo utilities
export const resetDemoData = () => {
  // In a real app, this might reset session data, clear local storage, etc.
  console.log('Demo data reset');
  // For now, we'll just return success
  return { success: true, message: 'Demo data reset successfully' };
};

export const getDemoComplaints = () => {
  return [
    "எனக்கு கண் எரிச்சல் இருக்கிறது", // I have eye irritation
    "கண்ணில் வெடிப்பு இருக்கிறது", // I have eye pain
    "தெளிவாக பார்க்க முடியவில்லை", // I have blurred vision
    "கண்கள் தூசி பறக்கிறது", // My eyes are watery
    "அடர் பார்வை சிக்கல்", // I have difficulty seeing clearly
  ];
};