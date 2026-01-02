// Sound utility for success/error sounds
export const playSuccessSound = () => {
  // In a real app, we would play an actual audio file
  // For demo purposes, we'll just log it
  console.log('Playing success sound');
};

export const playErrorSound = () => {
  // In a real app, we would play an actual audio file
  // For demo purposes, we'll just log it
  console.log('Playing error sound');
};

// Create a tone using Web Audio API
export const playTone = (frequency, duration) => {
  if (typeof window !== 'undefined' && window.AudioContext) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.3;

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration / 1000);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  }
};

// Success tone - higher pitch
export const playSuccessTone = () => {
  playTone(800, 300); // 800Hz for 300ms
};

// Error tone - lower pitch
export const playErrorTone = () => {
  playTone(400, 400); // 400Hz for 400ms
};