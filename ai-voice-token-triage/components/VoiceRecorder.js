'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { playSuccessTone, playErrorTone } from '../utils/soundUtils';

const VoiceRecorder = ({ language, patientHistory }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingState, setRecordingState] = useState('idle'); // idle, recording, processing
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  const recognitionRef = useRef(null);
  const router = useRouter();

  // Tamil translations
  const translations = {
    ta: {
      idle: "பேசத் தொடங்கு",
      recording: "பதிவு செய்கிறது...",
      processing: "செயலாக்குகிறது...",
      recording_ta: "பதிவு செய்கிறது...",
      permission_denied: "ஒலியை அனுமதிக்கவும்"
    },
    en: {
      idle: "Start Speaking",
      recording: "Recording...",
      processing: "Processing...",
      recording_ta: "Recording...",
      permission_denied: "Please allow microphone access"
    }
  };

  const t = translations[language];

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Note: Tamil recognition support depends on browser capabilities
      recognition.continuous = true; // CHANGED: True allows speaking with pauses
      recognition.interimResults = true; // CHANGED: See text as you speak
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US'; // Dynamic Language Support

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingState('recording');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;

            // Should we auto-stop? 
            // In continuous mode, we rely on the user to press STOP, 
            // OR we can use a silence timer (advanced).
            // For now, let's keep it manual stop for full control, 
            // but update the state so user sees what they said.
            setTranscription(prev => prev + ' ' + finalTranscript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // Optional: Send to backend immediately? No, wait for Stop.
        // We will change the workflow: Capture ALL text, then user hits STOP -> Send.
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setRecordingState('idle');
        setIsRecording(false);
        setError(`Speech recognition error: ${event.error}`);
        playErrorTone();
      };

      recognition.onend = () => {
        if (isRecording) {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.error('Speech recognition not supported in this browser');
      setError('Speech recognition not supported in this browser');
    }
  };

  useEffect(() => {
    initSpeechRecognition();

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    try {
      recognitionRef.current.start();
      setRecordingState('recording');
      setTranscription('');
      setError('');
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setPermissionDenied(true);
      setError(t.permission_denied);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setRecordingState('processing');

      // Now that we stopped, send the ACCUMULATED transcription
      // Note: We need the latest transcription state. 
      // Since setState is async, purely relying on 'transcription' state might be risky here 
      // if it hasn't updated from the last 'onresult'. 
      // However, 'onresult' fires before 'onend'.

      // Small timeout to ensure final processing
      setTimeout(() => {
        sendTranscriptionToBackend(transcription);
      }, 500);
    }
  };

  // Send transcription to backend for processing
  const sendTranscriptionToBackend = async (transcript) => {
    try {
      // Send to transcription API to convert Tamil to English and categorize
      // Use the provided transcript argument OR fall back to state if null/empty
      const textToSend = transcript || transcription;

      if (!textToSend || textToSend.trim() === '') {
        setError("No speech detected");
        setRecordingState('idle');
        return;
      }

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tamilText: textToSend,
          patientHistory: patientHistory || null // Pass context
        })
      });

      const data = await response.json();

      if (response.ok) {
        // --- INNOVATION: Multi-Turn Clarification ---
        if (data.clarification?.needed) {
          console.log("Clarification needed:", data.clarification.question);

          // 1. Play "Bing" sound to alert user
          playSuccessTone();

          // 2. Speak the Question (TTS)
          const utterance = new SpeechSynthesisUtterance(data.clarification.question);
          utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';
          window.speechSynthesis.speak(utterance);

          // 3. Update UI to show question prominently
          setError(`AI Question: ${data.clarification.question}`); // Keep this
          // TODO: Add a specific state for question if needed, but error prop is used for message currently.

          // 4. Robust Auto-Record Fallback
          // We define a start function that clears old timers
          let hasRestarted = false;

          const restartRecording = () => {
            if (hasRestarted) return;
            hasRestarted = true;

            console.log("Restarting recording for clarification...");
            const oldText = textToSend;
            setTranscription(`${oldText} [CONTEXT] `);
            setError(`AI Waiting: ${data.clarification.question}`);
            startRecording();
          };

          // Try to trigger on TTS end
          utterance.onend = () => {
            setTimeout(restartRecording, 500);
          };

          // Fallback: If TTS fails/blocks, force restart after 3s
          setTimeout(() => {
            if (!hasRestarted) {
              console.log("TTS timeout - forcing restart");
              restartRecording();
            }
          }, 3000);

          return; // STOP here
        }

        // Update transcription with the processed result
        setTranscription(data.transcribed_text);
        playSuccessTone(); // Play success sound

        // Navigate to complaint mapping after successful transcription
        // Pass the FULL data object (category, confidence, severity) serialized
        setTimeout(() => {
          const queryParams = new URLSearchParams({
            complaint: data.transcribed_text,
            category: data.category_prediction?.category || "GENERAL",
            confidence: data.category_prediction?.confidence || "0.8",
            severity: data.category_prediction?.severity || "low",
            reasoning: data.category_prediction?.reasoning || "",
            stress: data.audio_analysis?.stress_level || "normal",
            pain: data.audio_analysis?.pain_detected || "false",
            risks: JSON.stringify(data.risk_factors || []),
            ml: data.ml_score || "0"
          }).toString();

          router.push(`/complaint-mapping?${queryParams}`);
        }, 1000);
      } else {
        setError('Transcription processing failed: ' + data.message);
        playErrorTone();
        setRecordingState('idle');
      }
    } catch (err) {
      console.error('Error sending transcription to backend:', err);
      setError('Failed to process transcription');
      playErrorTone();
      setRecordingState('idle');
    }
  };

  // Generate waveform bars for visualization (simplified when using speech recognition)
  const WaveformVisualization = () => {
    if (recordingState !== 'recording') return null;

    return (
      <div className="flex items-center justify-center mt-4">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="waveform-bar"
            style={{
              height: `${Math.random() * 15 + 5}px`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      {/* Microphone Button */}
      <button
        onClick={toggleRecording}
        disabled={recordingState === 'processing'}
        className={`
          voice-btn w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center
          text-white text-xl md:text-2xl font-bold shadow-lg transform transition-all duration-300
          ${recordingState === 'idle'
            ? 'bg-primary-500 hover:bg-primary-600'
            : recordingState === 'recording'
              ? 'bg-red-500 pulse'
              : 'bg-blue-400 cursor-not-allowed'}
        `}
      >
        {recordingState === 'idle' && (
          <span className="text-center px-2">{t.idle}</span>
        )}
        {recordingState === 'recording' && (
          <span className="text-center px-2">{t.recording_ta}</span>
        )}
        {recordingState === 'processing' && (
          <span className="text-center px-2">{t.processing}</span>
        )}
      </button>

      {/* Waveform Visualization */}
      <WaveformVisualization />

      {/* Status Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Transcription Display */}
      {transcription && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg w-full max-w-md">
          <p className="font-semibold">Transcription:</p>
          <p>{transcription}</p>
        </div>
      )}

      {/* Recording indicator */}
      {recordingState === 'recording' && (
        <div className="mt-4 text-red-500 font-bold animate-pulse">
          {t.recording}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;