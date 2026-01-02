/**
 * Risk Context Engine
 * Calculates Priority Upgrade based on Patient History
 * Ref: dataold.txt
 */

export function calculateRiskScore(patient, currentComplaint) {
    let score = 0;
    let riskFactors = [];

    if (!patient) return { score: 0, factors: [] };

    const hx = patient.history || {};

    // 1. Age Factor
    if (patient.age > 60) {
        score += 1;
        riskFactors.push("Elderly (>60)");
    }

    // 2. Systemic Disease
    if (hx.diabetes) {
        score += 2;
        riskFactors.push("Diabetic");
    }

    // 3. Ocular History
    if (hx.glaucoma) {
        score += 3;
        riskFactors.push("Glaucoma History");
    }

    if (hx.one_eyed) {
        score += 4;
        riskFactors.push("One-Eyed Patient (High Risk)");
    }

    // 4. Recent Surgery (<30 Days)
    if (hx.surgeries && hx.surgeries.length > 0) {
        const lastSurgeryStr = hx.surgeries[0].match(/(\d{4}-\d{2}-\d{2})/); // Basic regex extraction
        if (lastSurgeryStr) {
            const sxDate = new Date(lastSurgeryStr[0]);
            const daysDiff = (new Date() - sxDate) / (1000 * 60 * 60 * 24);
            if (daysDiff < 30) {
                score += 4;
                riskFactors.push(`Recent Surgery (${Math.floor(daysDiff)} days ago)`);
            }
        }
    }

    return { score, factors: riskFactors };
}

export function adjustEsiLevel(baseEsi, riskAnalysis) {
    // Logic: If Risk Score >= threshold, upgrade ESI (Lower number = Higher Priority)
    // ESI-1 is max. ESI-5 is min.

    let finalEsi = baseEsi;
    const { score, factors } = riskAnalysis;

    // Thresholds from dataold.txt logic
    // Score 10+ is High Risk
    // Key Rules:
    // One-eyed + any complaint -> Upgrade
    // Glaucoma + Pain -> Upgrade

    // Simple Upgrade Logic
    if (score >= 4) {
        // Upgrade by 1 level (e.g., 3 -> 2)
        if (finalEsi > 1) finalEsi -= 1;
    }

    return {
        originalEsi: baseEsi,
        finalEsi: finalEsi,
        isUpgraded: finalEsi < baseEsi,
        riskScore: score,
        riskFactors: factors
    };
}
