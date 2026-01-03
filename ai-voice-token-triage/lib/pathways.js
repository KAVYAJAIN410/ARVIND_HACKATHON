/**
 * Clinical Pathways Definition
 * Maps ESI Levels to Station Sequences
 */

export const STATIONS = {
    REGISTRATION: 'registration',
    VISION: 'vision_test',
    REFRACTION: 'refraction', // New
    DILATION: 'dilation',     // New
    FUNDUS: 'fundus_photo',   // New
    INVESTIGATION: 'investigation', // New
    IOP: 'iop_check',
    DOCTOR: 'doctor_consult',
    EMERGENCY: 'trauma_center', // Renamed from emergency_room
    PHARMACY: 'pharmacy',
    DISCHARGE: 'discharge'
};

export const PATHWAYS = {
    // 🔴 ESI-1: Immediate Life/Vision Threat
    // Skip everything -> Direct to Emergency
    1: [
        STATIONS.EMERGENCY,
        STATIONS.DISCHARGE
    ],

    // 🟠 ESI-2: Urgent (e.g., Sudden Pain/Loss)
    // Vision -> Doctor (Fast Track) -> Investigation (if needed)
    2: [
        STATIONS.VISION,
        STATIONS.DOCTOR,
        STATIONS.INVESTIGATION,
        STATIONS.PHARMACY,
        STATIONS.DISCHARGE
    ],

    // 🟡 ESI-3: Standard Care (Full Workup)
    // Vision -> Refraction -> Dilation -> Doctor
    3: [
        STATIONS.VISION,
        STATIONS.REFRACTION,
        STATIONS.IOP,
        STATIONS.DILATION,
        STATIONS.DOCTOR,
        STATIONS.PHARMACY,
        STATIONS.DISCHARGE
    ],

    // 🟢 ESI-4: Refraction / Simple
    // Vision -> Refraction -> Pharmacy (Optom driven)
    4: [
        STATIONS.VISION,
        STATIONS.REFRACTION,
        STATIONS.PHARMACY,
        STATIONS.DISCHARGE
    ],

    // 🔵 ESI-5: Admin / Pharmacy Only
    5: [
        STATIONS.PHARMACY,
        STATIONS.DISCHARGE
    ]
};

// Specific Complaint-Based Pathways (User Defined)
export const COMPLAINT_PATHWAYS = {
    // 1. Redness
    'REDNESS': [
        STATIONS.VISION,
        STATIONS.DOCTOR,
        STATIONS.PHARMACY // Added
    ],
    // 2. Blurred Vision (Simple)
    'BLURRED_VISION': [
        STATIONS.VISION,
        STATIONS.DOCTOR,
        STATIONS.PHARMACY
    ],
    // 3. Pain
    'PAIN': [
        STATIONS.VISION,
        STATIONS.INVESTIGATION,
        STATIONS.DOCTOR,
        STATIONS.PHARMACY
    ],
    // 4. Detailed Blurred Vision / Refractive
    'REFRACTIVE_ERROR': [
        STATIONS.VISION,
        STATIONS.REFRACTION,
        STATIONS.INVESTIGATION,
        STATIONS.DILATION,
        STATIONS.DOCTOR,
        STATIONS.PHARMACY
    ],
    // 5. Chemical / Trauma
    'TRAUMA': [
        STATIONS.EMERGENCY, // Trauma Center
        STATIONS.VISION,
        STATIONS.DOCTOR,
        STATIONS.PHARMACY
    ],
    // 6. Routine Checkup
    'ROUTINE': [
        STATIONS.VISION,
        STATIONS.REFRACTION,
        STATIONS.FUNDUS, // Added
        STATIONS.DOCTOR,
        STATIONS.PHARMACY
    ]
};

export function getPathwayForESI(esiLevel, category) {
    // 1. Check for Specific Category Match First
    if (category && COMPLAINT_PATHWAYS[category]) {
        return COMPLAINT_PATHWAYS[category];
    }
    // 2. Fallback to ESI Level
    return PATHWAYS[esiLevel] || PATHWAYS[3];
}
