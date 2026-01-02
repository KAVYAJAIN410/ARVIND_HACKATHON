
/**
 * Tanglish Map (Phonetic Tamil -> English)
 * 
 * This dictionary handles common phonetic variations spoken by patients.
 * It is used to normalize "Tanglish" inputs before sending them to the GenAI/Fuzzy engine.
 */

const tanglishDictionary = {
    // Body Parts
    "kannu": "eye",
    "kan": "eye",
    "kanna": "eye",
    "thalai": "head",
    "thala": "head",
    "kai": "hand",
    "kaal": "leg",
    "vayiru": "stomach",

    // Symptoms
    "vali": "pain",
    "valikudhu": "pain",
    "hurts": "pain",
    "sore": "pain",
    "aching": "pain",
    "erichal": "irritation",
    "burning": "irritation",
    "aripu": "itching",
    "problem": "issue",
    "arippu": "itching",
    "mangal": "blur",
    "mangala": "blur",
    "theriyala": "cant see",
    "terila": "cant see",
    "therla": "cant see",
    "parvai": "vision",
    "checkup": "checkup",
    "prescription": "prescription",
    "test": "checkup",
    "thanni": "water",
    "neer": "water",
    "veekam": "swelling",
    "pus": "pus",
    "seel": "pus",
    "katti": "swelling",
    "adipattu": "hit",
    "adi": "hit",
    "ratham": "blood",
    "sivappu": "red",
    "red": "red",
    "sugar": "diabetes",
    "diabetes": "diabetes",
    "pressure": "bp",
    "bp": "bp",
    "kannadi": "glasses",
    "spectacles": "glasses",
    "power": "refraction",

    // Modifiers / Context
    "romba": "very",
    "bayangara": "severe",
    "konjam": "little",
    "inniki": "today",
    "nethu": "yesterday",
    "kaalai": "morning",
    "night": "night",
    "ippo": "now"
};

export const normalizeTanglish = (text) => {
    if (!text) return "";

    // Split text into words, normalize to lowercase
    const words = text.toLowerCase().split(/\s+/);

    // Map words, keeping original if not found
    const normalizedWords = words.map(word => {
        // Simple direct mapping
        if (tanglishDictionary[word]) return tanglishDictionary[word];

        // Handle simple suffixes (very basic stemming simulation)
        // e.g., "valikudhu" -> "vali" -> "pain"
        // This is a comprehensive list for demo; real implementation would use a stemmer.
        return word;
    });

    return normalizedWords.join(" ");
};
