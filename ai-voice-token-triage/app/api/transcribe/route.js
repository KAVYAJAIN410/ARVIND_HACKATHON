import { NextResponse } from 'next/server';
import Fuse from 'fuse.js';
import { analyzeMedicalContext } from '../../../lib/genAiTriage';
import { normalizeTanglish } from '../../../lib/tanglishMap';
import { calculateRiskScore, adjustEsiLevel } from '../../../lib/riskEngine';
import { determineESILevel } from '../../../lib/esiRules';
import { predictRiskProbability } from '../../../lib/mlRiskModel'; // Machine Learning

// Enhanced Medical Ontology with Symptoms and Categories
const medicalOntology = [
  // OPD / General Irritation
  { symptom: "eye irritation", category: "OPD_GENERAL", severity: "low", tamil: "கண் எரிச்சல்" },
  { symptom: "itching", category: "OPD_GENERAL", severity: "low", tamil: "அரிப்பு" },
  { symptom: "redness", category: "OPD_GENERAL", severity: "medium", tamil: "சிவப்பு" },
  { symptom: "watery eyes", category: "OPD_GENERAL", severity: "low", tamil: "கண் நீர்" },
  { symptom: "dust in eye", category: "OPD_GENERAL", severity: "medium", tamil: "தூசி" },

  // Ophthalmology / Pain (Cornea/Retina)
  { symptom: "eye pain", category: "OPHTHALMOLOGY", severity: "high", tamil: "கண் வலி" },
  { symptom: "painful eye", category: "OPHTHALMOLOGY", severity: "high", tamil: "வலி" },
  { symptom: "severe pain", category: "OPHTHALMOLOGY", severity: "high", tamil: "கடுமையான வலி" },
  { symptom: "swelling", category: "OPHTHALMOLOGY", severity: "medium", tamil: "வீக்கம்" },
  { symptom: "infection", category: "OPHTHALMOLOGY", severity: "medium", tamil: "தொற்று" },
  { symptom: "pus", category: "OPHTHALMOLOGY", severity: "medium", tamil: "சீழ்" },
  { symptom: "red eye", category: "OPHTHALMOLOGY", severity: "medium", tamil: "சிவப்பு கண்" },
  { symptom: "burning", category: "OPHTHALMOLOGY", severity: "medium", tamil: "எரிச்சல்" },

  // Cataract / Elderly
  { symptom: "cloudy vision", category: "CATARACT", severity: "medium", tamil: "மேகமூட்டமான பார்வை" },
  { symptom: "cataract", category: "CATARACT", severity: "medium", tamil: "கண்புரை" },
  { symptom: "white spot", category: "CATARACT", severity: "medium", tamil: "வெள்ளை புள்ளி" },

  // Retina / Diabetes
  { symptom: "flashes", category: "RETINA", severity: "high", tamil: "மின்னல்" },
  { symptom: "floaters", category: "RETINA", severity: "medium", tamil: "மிதவைகள்" },
  { symptom: "black spots", category: "RETINA", severity: "medium", tamil: "கரும்புள்ளிகள்" },
  { symptom: "diabetes checkup", category: "RETINA", severity: "medium", tamil: "சர்க்கரை நோய்" },
  { symptom: "vision loss", category: "RETINA", severity: "high", tamil: "பார்வை இழப்பு" },
  { symptom: "cant see", category: "RETINA", severity: "high", tamil: "பார்க்க முடியவில்லை" },

  // Neuro / Headache
  { symptom: "headache", category: "NEURO", severity: "medium", tamil: "தலைவலி" },
  { symptom: "migraine", category: "NEURO", severity: "medium", tamil: "ஒற்றைத் தலைவலி" },

  // General Checkup
  { symptom: "routine checkup", category: "GENERAL_CHECKUP", severity: "low", tamil: "வழக்கமான பரிசோதனை" },
  { symptom: "general checkup", category: "GENERAL_CHECKUP", severity: "low", tamil: "பொது பரிசோதனை" },
  { symptom: "eye exam", category: "GENERAL_CHECKUP", severity: "low", tamil: "கண் ஆய்வு" },
  { symptom: "spectacles", category: "REFRACTION", severity: "low", tamil: "மூக்குக்கண்ணாடி" },
  { symptom: "glasses", category: "REFRACTION", severity: "low", tamil: "கண்ணாடி" },
  { symptom: "prescription", category: "REFRACTION", severity: "low", tamil: "மருந்து சீட்டு" }
];

// Configure Fuse.js for fuzzy matching
const fuse = new Fuse(medicalOntology, {
  keys: ['symptom', 'tamil'],
  threshold: 0.5, // INCREASED TOLERANCE
  includeScore: true
});

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type');
    let inputAudioText = "";
    let patientHistory = null;

    // 1. Input Parsing
    if (contentType && contentType.includes('application/json')) {
      const data = await request.json();
      inputAudioText = data.tamilText;
      patientHistory = data.patientHistory;
    } else {
      const formData = await request.formData();
      inputAudioText = formData.get('tamilText');
      // No history support on form data currently
    }

    if (!inputAudioText) inputAudioText = "general checkup";

    // --- INNOVATION 1: Tanglish Normalization ---
    const normalizedText = normalizeTanglish(inputAudioText);

    // Stopword Removal
    const stopWords = ["i", "have", "my", "a", "an", "the", "is", "please", "can", "you", "enaku"];
    const textToAnalyze = (normalizedText || inputAudioText)
      .split(' ')
      .filter(word => !stopWords.includes(word.toLowerCase()))
      .join(' ');

    console.log(`[Transcribe Debug] Input: "${inputAudioText}"`);
    console.log(`[Transcribe Debug] Normalized & Cleaned: "${textToAnalyze}"`);

    // --- INNOVATION 2: Audio Sentiment Analysis (REMOVED) ---
    // User requested removal. Logic commented out or removed.
    let sentimentScore = 0.5;
    let stressLevel = "normal";
    let painDetected = false;

    /* REMOVED
    const distressWords = ["unbearable", "ah", "ouch", "severe", "blood", "burning", "vali", "pain"];
    const matches = distressWords.filter(w => textToAnalyze.toLowerCase().includes(w));

    if (matches.length > 0 || textToAnalyze.includes('!')) {
      sentimentScore = 0.9;
      stressLevel = "high";
      painDetected = true;
    }
    */

    // 2. GenAI Context Analysis
    const genAiResult = analyzeMedicalContext(textToAnalyze);

    let finalSymptom = textToAnalyze;
    let finalSeverity = "low";
    let finalConfidence = 0.5;
    let aiReasoning = "Standard pattern matching";

    // --- 3. ESI (Emergency Severity Index) Protocol Engine (NEW) ---
    const esiResult = determineESILevel(textToAnalyze, patientHistory);

    let riskFactorsDetected = []; // Initialize logic container

    // --- 4. ML Risk Analysis ---
    // We still run ML to detect hidden patterns the manual rules might miss
    // e.g., "Mild pain" is ESI-3, but if ML sees "Glaucoma + Mild Pain" it might suggest higher risk.
    const mlAnalysis = predictRiskProbability(patientHistory || {}, textToAnalyze);
    let mlProbabilityScore = mlAnalysis.probability;

    // --- 5. Final Synthesis: MAX(ESI, ML) ---
    // Start with the ESI Rule result
    let finalCategory = "OPD_GENERAL";
    finalSymptom = esiResult.condition;
    finalSeverity = "low"; // Mapping for old UI compatibility
    let finalEsiLevel = esiResult.level;
    aiReasoning = `ESI-${esiResult.level}: ${esiResult.condition}`;

    // Map ESI specific categories if possible (simple heuristic)
    if (esiResult.level === 1) {
      finalCategory = "EMERGENCY";
      finalSeverity = "high";
    } else if (esiResult.level === 2) {
      finalCategory = "OPHTHALMOLOGY"; // Generic Urgent
      if (textToAnalyze.includes("flash") || textToAnalyze.includes("curtain")) finalCategory = "RETINA";
      finalSeverity = "high";
    } else if (esiResult.level === 4) {
      finalCategory = "REFRACTION";
      finalSeverity = "low";
    }

    // FAIL-SAFE: If ML detects HIGH RISK (80%+), but ESI rule missed it (e.g. ESI-3 or 4)
    // Upgrade it to at least ESI-2.
    if (mlAnalysis.isHighRisk && finalEsiLevel > 2) {
      finalEsiLevel = 2; // Force partial upgrade
      aiReasoning += " [UPGRADED by ML: Hidden Risk Pattern Detected]";
      finalSeverity = "high";
      finalCategory = "OPHTHALMOLOGY";

      // Populate risk factors for UI
      riskFactorsDetected.push(`ML High Risk: ${mlProbabilityScore}%`);
      riskFactorsDetected.push(...mlAnalysis.features_used);
    }


    // --- INNOVATION: Multi-Turn Ambiguity Detection ---
    let clarificationNeeded = false;
    let clarificationQuestion = null;
    const wordCount = textToAnalyze.split(' ').length;

    if (wordCount < 3 && textToAnalyze.includes('pain') && !textToAnalyze.includes('eye')) {
      clarificationNeeded = true;
      clarificationQuestion = "Is the pain inside your eye, or around your eye?";
    } else if (wordCount < 3 && (textToAnalyze.includes('blur') || textToAnalyze.includes('vision'))) {
      clarificationNeeded = true;
      clarificationQuestion = "Is it blurry for far away or for reading?";
    }

    const response = {
      original_language: "Tamil/Tanglish",
      transcribed_text: finalSymptom,
      raw_transcript: inputAudioText,
      category_prediction: {
        category: finalCategory,
        confidence: 0.85, // Standardize confidence for now
        severity: finalSeverity,
        reasoning: aiReasoning,
        pain_detected: painDetected,
        risk_factors: mlAnalysis.features_used, // Use full feature list
        ml_score: mlProbabilityScore,
        esi_level: finalEsiLevel,
        esi_action: esiResult.action
      },
      audio_analysis: {
        stress_level: stressLevel,
        sentiment_score: sentimentScore
      },
      duration: 3.5,
      clarification: {
        needed: clarificationNeeded,
        question: clarificationQuestion
      },
      // Pass back Risk Info
      risk_factors: riskFactorsDetected,
      ml_score: mlProbabilityScore
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed', message: error.message },
      { status: 500 }
    );
  }
}