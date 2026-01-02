import { NextResponse } from 'next/server';
import Fuse from 'fuse.js';
import { analyzeMedicalContext } from '../../../lib/genAiTriage';
import { normalizeTanglish } from '../../../lib/tanglishMap';
import { calculateRiskScore, adjustEsiLevel } from '../../../lib/riskEngine';
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

    let finalCategory = "OPD_GENERAL";
    let finalSymptom = textToAnalyze;
    let finalSeverity = "low";
    let finalConfidence = 0.5;
    let aiReasoning = "Standard pattern matching";

    if (genAiResult.category) {
      finalCategory = genAiResult.category;
      finalSymptom = textToAnalyze;
      finalSeverity = genAiResult.severity; // 'low', 'medium', 'high'
      finalConfidence = genAiResult.confidence;
      aiReasoning = genAiResult.reasoning;
    } else {
      // Fallback Logic (omitted for brevity, assume similar to original)
      const searchResults = fuse.search(textToAnalyze);
      if (searchResults.length > 0) {
        const bestMatch = searchResults[0].item;
        finalCategory = bestMatch.category;
        finalSymptom = bestMatch.symptom;
        finalSeverity = bestMatch.severity;
        finalConfidence = (1 - searchResults[0].score).toFixed(2);
        aiReasoning = searchResults[0].score < 0.1 ? "Exact match" : "Fuzzy match";
      } else {
        finalCategory = "REFRACTION";
        finalSymptom = "Unclear Checkup";
        aiReasoning = "Default routing";
      }
    }

    // Voice Stress Adjustment (REMOVED)
    /*
    if (painDetected && finalSeverity !== 'high') {
      finalSeverity = 'medium';
      aiReasoning += " + Voice Stress Detected";
    }
    */

    // --- INTELLIGENT TRIAGE: Hybrid Fail-Safe Engine ---
    let riskFactorsDetected = [];
    let mlProbabilityScore = 0;

    if (patientHistory) {
      // 1. Rule-Based Analysis (The "Hard Floor")
      let baseEsi = 4;
      if (finalSeverity === 'medium') baseEsi = 3;
      if (finalSeverity === 'high') baseEsi = 2;

      const ruleAnalysis = calculateRiskScore(patientHistory, textToAnalyze);
      const ruleAdjustment = adjustEsiLevel(baseEsi, ruleAnalysis);

      // 2. ML Probabilistic Analysis (The "Sentinel")
      const mlResult = predictRiskProbability(patientHistory, textToAnalyze);
      mlProbabilityScore = mlResult.probability;

      // 3. FAIL-SAFE LOGIC (Max of Rule vs ML)
      const ruleSaysHighRisk = ruleAdjustment.isUpgraded;
      const mlSaysHighRisk = mlResult.isHighRisk; // > 50%

      const isHighRiskContext = ruleSaysHighRisk || mlSaysHighRisk;

      if (isHighRiskContext) {
        riskFactorsDetected = [...ruleAnalysis.factors]; // Keep rule explanations

        // If ML caught it but Rules missed it, explain why
        if (mlSaysHighRisk && !ruleSaysHighRisk) {
          riskFactorsDetected.push(`ML Pattern Match (${mlProbabilityScore}%)`);
          riskFactorsDetected.push(`Features: ${mlResult.features_used.join('+')}`);
        }

        // Force Upgrade
        if (finalSeverity === 'low') finalSeverity = 'medium';
        else if (finalSeverity === 'medium') finalSeverity = 'high';

        aiReasoning += `\n🛡️ HYBRID TRIAGE: High Risk Detected.`;
        if (ruleSaysHighRisk) aiReasoning += ` [Rule: ${ruleAdjustment.riskScore}]`;
        if (mlSaysHighRisk) aiReasoning += ` [ML: ${mlProbabilityScore}%]`;
      }
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
        confidence: finalConfidence,
        severity: finalSeverity,
        reasoning: aiReasoning
      },
      audio_analysis: {
        stress_level: stressLevel,
        pain_detected: painDetected,
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