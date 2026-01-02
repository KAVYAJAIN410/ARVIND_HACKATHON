/**
 * Machine Learning Risk Model (Naive Bayes Classifier)
 * Calculates P(HighRisk | Features)
 * 
 * Features: AgeGroup, History(Diabetes/Glaucoma/OneEyed), SymptomKeyword
 * 
 * FAIL-SAFE PHILOSOPHY:
 * This model outputs a probability (0-100%).
 * It is designated as "Decision Support".
 * It CANNOT override a hard safety rule (ESI-1).
 */

// 1. Synthetic Clinical Training Data (The "Knowledge Base")
// Format: { features: [AgeGroup, History, Symptom], label: "HighRisk" | "LowRisk" }
const trainingData = [
    // --- HIGH RISK PATTERNS (Critical) ---
    { features: ["elderly", "glaucoma", "pain", "severe"], label: "HighRisk" },
    { features: ["elderly", "glaucoma", "redness"], label: "HighRisk" },
    { features: ["adult", "one_eyed", "pain"], label: "HighRisk" },
    { features: ["adult", "one_eyed", "blur"], label: "HighRisk" },
    { features: ["elderly", "diabetes", "flashes"], label: "HighRisk" },
    { features: ["elderly", "diabetes", "black_spots"], label: "HighRisk" },
    { features: ["adult", "recent_surgery", "pain"], label: "HighRisk" },
    { features: ["adult", "recent_surgery", "redness"], label: "HighRisk" },
    { features: ["child", "none", "white_spot"], label: "HighRisk" },
    { features: ["any", "none", "chemical"], label: "HighRisk" },
    { features: ["any", "none", "trauma"], label: "HighRisk" },
    { features: ["any", "none", "severe_pain"], label: "HighRisk" },

    // --- LOW RISK PATTERNS (The Majority - ~80% of Cases) ---
    // We need MANY of these to fix the Prior Probability bias
    { features: ["adult", "none", "itching", "mild"], label: "LowRisk" },
    { features: ["child", "none", "itching"], label: "LowRisk" },
    { features: ["elderly", "none", "watering"], label: "LowRisk" },
    { features: ["adult", "diabetes", "checkup"], label: "LowRisk" },
    { features: ["elderly", "glaucoma", "checkup"], label: "LowRisk" },
    { features: ["adult", "none", "glasses"], label: "LowRisk" },
    { features: ["child", "none", "blur"], label: "LowRisk" },
    { features: ["adult", "none", "mild_pain", "mild"], label: "LowRisk" }, // Mild pain is usually low risk
    { features: ["adult", "none", "headache", "mild"], label: "LowRisk" },
    { features: ["elderly", "none", "checkup"], label: "LowRisk" },
    { features: ["child", "none", "checkup"], label: "LowRisk" },
    { features: ["adult", "none", "checkup"], label: "LowRisk" },
    { features: ["adult", "none", "dryness"], label: "LowRisk" },
    { features: ["elderly", "none", "dryness"], label: "LowRisk" },
    { features: ["adult", "none", "irritation", "mild"], label: "LowRisk" },
    { features: ["child", "none", "watering"], label: "LowRisk" },
    { features: ["adult", "none", "refraction"], label: "LowRisk" },
    { features: ["elderly", "cataract", "blur", "gradual"], label: "LowRisk" }, // Cataract is steady state
    { features: ["adult", "none", "tiredness"], label: "LowRisk" },
    { features: ["adult", "none", "strain"], label: "LowRisk" }
];

// 2. Training Logic (Naive Bayes)
const modelState = {
    classCounts: { HighRisk: 0, LowRisk: 0 },
    featureCounts: { HighRisk: {}, LowRisk: {} },
    totalCount: 0,
    vocab: new Set()
};

function trainModel() {
    // Reset state
    modelState.classCounts = { HighRisk: 0, LowRisk: 0 };
    modelState.featureCounts = { HighRisk: {}, LowRisk: {} };
    modelState.totalCount = 0;

    trainingData.forEach(item => {
        const label = item.label;
        modelState.classCounts[label]++;
        modelState.totalCount++;

        item.features.forEach(feature => {
            modelState.vocab.add(feature);
            if (!modelState.featureCounts[label][feature]) {
                modelState.featureCounts[label][feature] = 0;
            }
            modelState.featureCounts[label][feature]++;
        });
    });
    console.log("ML Model Trained on examples:", modelState.totalCount);
}

// Initial Training Signal
trainModel();

// 3. Prediction Logic
export function predictRiskProbability(patient, symptomText) {
    // A. Extract Features
    const features = [];

    // Age Feature
    if (patient.age > 60) features.push("elderly");
    else if (patient.age < 16) features.push("child");
    else features.push("adult");

    // History Features
    const hx = patient.history || {};
    if (hx.glaucoma) features.push("glaucoma");
    if (hx.diabetes) features.push("diabetes");
    if (hx.one_eyed) features.push("one_eyed");

    if (hx.surgeries && hx.surgeries.length > 0) features.push("recent_surgery");
    else features.push("none");

    // Symptom & Intensity Features
    const lowerText = symptomText.toLowerCase();

    // Intensity Modifiers (Context is King)
    if (lowerText.includes("mild") || lowerText.includes("light") || lowerText.includes("little")) {
        features.push("mild");
    }
    if (lowerText.includes("severe") || lowerText.includes("unbearable") || lowerText.includes("extreme")) {
        features.push("severe");
    }

    const symptoms = ["pain", "redness", "blur", "flashes", "black_spots", "itching", "watering", "checkup", "glasses", "chemical", "trauma", "white_spot", "dryness", "strain"];

    symptoms.forEach(sym => {
        if (lowerText.includes(sym)) {
            // Nuance: "Mild Pain" vs "Pain"
            if (sym === "pain" && lowerText.includes("mild")) {
                features.push("mild_pain");
            } else if (sym === "pain" && lowerText.includes("severe")) {
                features.push("severe_pain");
            } else {
                features.push(sym);
            }
        }
    });

    // B. Calculate Probabilities P(Class | Features)
    // P(C|F) ~ P(C) * P(F1|C) * P(F2|C) ...

    const scores = { HighRisk: 0, LowRisk: 0 }; // Log scores

    ["HighRisk", "LowRisk"].forEach(cls => {
        // P(C)
        const classProb = modelState.classCounts[cls] / modelState.totalCount;
        scores[cls] = Math.log(classProb);

        // P(Feat | C)
        features.forEach(feat => {
            // Laplacian Smoothing (+1)
            const count = (modelState.featureCounts[cls][feat] || 0) + 1;
            const totalFeaturesInClass = Object.values(modelState.featureCounts[cls]).reduce((a, b) => a + b, 0) + modelState.vocab.size;

            const prob = count / totalFeaturesInClass;
            scores[cls] += Math.log(prob);
        });
    });

    // Convert Log Odds to Probability
    // Not strictly necessary for classification, but good for UI "Confidence"
    // Softmax-ish approximation for 2 classes
    const expHigh = Math.exp(scores.HighRisk);
    const expLow = Math.exp(scores.LowRisk);
    const probabilityHigh = expHigh / (expHigh + expLow);

    return {
        probability: (probabilityHigh * 100).toFixed(1), // Percentage
        isHighRisk: probabilityHigh > 0.5, // Threshold
        features_used: features
    };
}
