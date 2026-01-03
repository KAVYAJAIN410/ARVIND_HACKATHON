/**
 * Emergency Severity Index (ESI) Rule Engine for Ophthalmology
 * Based on 'esicondition.txt'
 * 
 * Levels: 1 (Immediate) to 5 (Minimal)
 * Returns: { level: number, title: string, color: string, action: string, condition: string }
 */

export function determineESILevel(text, patientHistory = {}) {
    const t = text.toLowerCase();

    // Helper to check keywords
    const has = (keywords) => keywords.some(k => t.includes(k));
    const hasAll = (keywords) => keywords.every(k => t.includes(k));

    // --- 🔴 ESI-1: IMMEDIATE (Threat to Vision/Life) ---
    // Action: 🚨 Immediate ophthalmologist, Skip queues

    // 1. Chemical / Physical Injury
    if (has(['chemical', 'acid', 'alkali', 'battery', 'lime', 'powder', 'splash']))
        return createResult(1, "EMERGENCY", "Use Safety Shower / Irrigate Immediately");

    if (has(['penetrating', 'cut', 'knife', 'sharp', 'stick', 'stab', 'open globe', 'bleeding', 'blood']))
        return createResult(1, "EMERGENCY", "Immediate Surgical Consult");

    // 2. Sudden Vision Loss (NPL)
    if (has(['sudden', 'blackout', 'darkness', 'cannot see', 'blind']) && has(['now', 'hour', 'minute', 'today']))
        return createResult(1, "EMERGENCY", "Immediate Retina/Neuro Check");

    // 3. Acute Glaucoma (Pain + Nausea)
    if (has(['pain', 'severe']) && has(['vomit', 'nausea', 'headache']))
        return createResult(1, "EMERGENCY", "Check IOP Immediately");


    // --- 🟠 ESI-2: URGENT (High Risk of Damage) ---
    // Action: ⚠️ Doctor within 10–15 mins

    // 1. Retinal Symptoms
    if (has(['flash', 'floater', 'curtain', 'shadow', 'black spot', 'spider', 'web']) && !hasAll(['mild', 'chronic']))
        return createResult(2, "Retinal Symptoms", "Dilated Fundus Exam Required");

    if (has(['double', 'diplopia']) && has(['new', 'sudden']))
        return createResult(2, "Sudden Double Vision", "Neuro-Ophthalmology Priority");

    // 2. Infections / Ulcers
    if (has(['white spot', 'ulcer', 'pus', 'sticky', 'yellow discharge']) && has(['pain']))
        return createResult(2, "Suspected Corneal Ulcer", "Cornea Specialist Priority");

    // 3. Severe Pain / Photophobia
    if (has(['severe', 'unbearable', 'extreme']) && has(['pain', 'hurt', 'agony']))
        return createResult(2, "Severe Eye Pain", "Pain Management & Exam");

    if (has(['light', 'sun']) && has(['hurt', 'sensitive', 'photophobia']))
        return createResult(2, "Photophobia", "Cornea/Uveitis Assessment");

    // 4. Pediatric Red Eye (Child Rule)
    if (patientHistory.age < 16 && has(['red', 'pain', 'rubbing']))
        return createResult(2, "Pediatric Red Eye", "Pediatric Priority Lane");

    // 5. One-Eyed Patient Risk (Context Rule)
    if (patientHistory.history?.one_eyed && (has(['pain', 'blur', 'red', 'dim'])))
        return createResult(2, "One-Eyed Patient (Risk)", "Protect Remaining Eye - Priority");


    // --- 🟡 ESI-3: SEMI-URGENT (Stable, Diagnostics Needed) ---
    // Action: Normal OPD flow, multiple resources

    // 1. Gradual Vision Issues
    if (has(['blur', 'dim', 'hazy', 'foggy', 'cloudy']) && !has(['sudden', 'pain']))
        return createResult(3, "Gradual Vision Loss", "Refraction & Dilated Exam");

    // 2. Moderate Discomfort
    if (has(['mild pain', 'dull ache', 'strain', 'tired', 'heavy', 'watering', 'tearing']))
        return createResult(3, "Moderate Discomfort", "General Ophthalmology Exam");

    // Catch-all for "Pain" (Undifferentiated) -> Treat as ESI-3 (or upgradeable by ML)
    if (has(['pain', 'hurt', 'ache', 'sore']))
        return createResult(3, "Eye Pain (Undifferentiated)", "General Assessment");

    if (has(['red', 'pink']) && !has(['pain', 'severe']))
        return createResult(3, "Red Eye (Stable)", "General Ophthalmology Exam");

    if (has(['dry', 'gritty', 'sand', 'scratchy']))
        return createResult(3, "Dry Eye/Irritation", "Schirmer Test & Exam");

    if (patientHistory.history?.glaucoma && has(['checkup', 'routine', 'review']))
        return createResult(3, "Glaucoma Follow-up", "IOP & Fields Test");


    // --- 🟢 ESI-4: NON-URGENT (Single Resource) ---
    // Action: Fast-track, Optom only often sufficient

    if (has(['glass', 'spectacle', 'power', 'checkup', 'test', 'routine', 'refraction', 'read', 'far', 'near']))
        return createResult(4, "Refraction / Vision Check", "Optometry Lane");

    if (has(['itch', 'mild', 'allergy']) && !has(['pain', 'red']))
        return createResult(4, "Mild Allergy/Itching", "General Checkup");


    // --- 🔵 ESI-5: ADMINISTRATIVE ---
    if (has(['medicine', 'pharmacy', 'refill', 'drop']))
        return createResult(5, "Pharmacy / Refill", "Pharmacy Direct");

    if (has(['report', 'certificate', 'paper', 'bill']))
        return createResult(5, "Administrative", "Front Desk / Admin");


    // --- FALLBACK ---
    // If unsure, default to ESI-3 (Safe middle ground)
    return createResult(3, "Unspecified Complaint", "General Triage Assessment");
}

function createResult(level, condition, action) {
    const map = {
        1: { color: "bg-red-600", text: "text-white", label: "IMMEDIATE" },
        2: { color: "bg-orange-500", text: "text-white", label: "URGENT" },
        3: { color: "bg-yellow-400", text: "text-black", label: "SEMI-URGENT" },
        4: { color: "bg-green-500", text: "text-white", label: "NON-URGENT" },
        5: { color: "bg-blue-500", text: "text-white", label: "MINIMAL" }
    };

    return {
        level,
        title: map[level].label,
        condition,
        action,
        colorClass: map[level].color,
        textClass: map[level].text
    };
}
