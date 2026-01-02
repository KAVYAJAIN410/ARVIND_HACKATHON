
// Simulated GenAI / Heuristic Engine
// In a real app, this would call OpenAI/Gemini API.
// Here, we use advanced weighted keyword density simulated logic.

export const analyzeMedicalContext = (text) => {
    const lowerText = text.toLowerCase();

    // 1. Keyword Bags acting as "Concepts"
    const concepts = {
        URGENT_TRAUMA: {
            keywords: ['injury', 'hit', 'spark', 'welding', 'chemical', 'acid', 'burn', 'bleeding', 'blood', 'cut', 'trauma', 'accident', 'hammer', 'stone', 'poke', 'stick', 'something fell', 'scratch'],
            category: 'EMERGENCY',
            severity: 'high',
            reasoning: 'Detected keywords suggesting physical trauma or injury.'
        },
        RETINA_COMPLEX: {
            keywords: ['diabetes', 'diabetic', 'sugar', 'bp', 'pressure', 'hypertension', 'flashes', 'floaters', 'black spots', 'curtain', 'shadow', 'sudden loss', 'darkness', 'cant see'],
            category: 'RETINA',
            severity: 'high',
            reasoning: 'Symptoms or history indicative of Retinal issues (Diabetic/Vascular).'
        },
        CATARACT_ELDERLY: {
            keywords: ['cloudy', 'foggy', 'misty', 'white', 'glare', 'halo', 'dim', 'night', 'old', 'age', '60', 'senior', 'cataract', 'motia', 'cloud'],
            category: 'CATARACT',
            severity: 'medium',
            reasoning: 'Symptoms consistent with Cataract or age-related vision changes.'
        },
        NEURO_OPHTHALMOLOGY: {
            keywords: ['headache', 'head ache', 'migraine', 'dizzy', 'vomit', 'nausea', 'double', 'drooping'],
            category: 'NEURO',
            severity: 'medium',
            reasoning: 'Neurological symptoms detected (Headache/Diplopia).'
        },
        INFECTIVE_CORNEA: {
            keywords: ['pus', 'discharge', 'sticky', 'yellow', 'white spot', 'ulcer', 'painful', 'severe pain', 'cannot open', 'light sensitivity', 'photophobia'],
            category: 'OPHTHALMOLOGY',
            severity: 'high',
            reasoning: 'Signs of active infection or corneal distress.'
        },
        REFRACTION_VISION: {
            keywords: ['blur', 'clear', 'see', 'vision', 'read', 'glass', 'spectacle', 'power', 'sight', 'far', 'near', 'newspaper', 'book', 'computer', 'strain', 'focus', 'checkup', 'test', 'look'],
            category: 'REFRACTION',
            severity: 'low',
            reasoning: 'Vision clarity or prescription related checks.'
        },
        OPHTHALMOLOGY_GENERAL: {
            keywords: ['pain', 'hurt', 'ache', 'red', 'water', 'tear', 'itch', 'rub', 'burn', 'foreign', 'dust', 'insect', 'went inside', 'sand', 'sore'],
            category: 'OPHTHALMOLOGY',
            severity: 'medium',
            reasoning: 'General symptomatic complaints (Redness/Pain/Irritation).'
        }
    };

    // 2. Scoring Mechanism
    let bestMatch = null;
    let maxScore = 0;

    for (const [key, context] of Object.entries(concepts)) {
        let score = 0;
        context.keywords.forEach(word => {
            if (lowerText.includes(word)) {
                score += word.length; // Longer words = higher weight/specificity
                // Bonus for exact word boundaries to avoid substrings like 'car' in 'card'
                // simplified for demo
            }
        });

        if (score > maxScore) {
            maxScore = score;
            bestMatch = context;
        }
    }

    // 3. Return Best Match or Null
    if (bestMatch && maxScore > 2) {
        return {
            category: bestMatch.category,
            severity: bestMatch.severity,
            confidence: Math.min(0.5 + (maxScore * 0.05), 0.99).toFixed(2),
            reasoning: bestMatch.reasoning
        };
    }

    // Default return (null means fall back to other methods)
    return {
        category: null,
        severity: 'low',
        confidence: 0.5,
        reasoning: null
    };
};
