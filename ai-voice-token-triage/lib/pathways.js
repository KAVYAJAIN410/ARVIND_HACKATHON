/**
 * Clinical Pathways Definition
 * Maps ESI Levels to Station Sequences
 */

export const STATIONS = {
    REGISTRATION: 'registration',
    VISION: 'vision_test',
    IOP: 'iop_check',
    DOCTOR: 'doctor_consult',
    EMERGENCY: 'emergency_room',
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

    // 🟠 ESI-2: Urgent
    // Fast track to Doctor, skip routine checks if possible
    2: [
        STATIONS.VISION, // Quick check
        STATIONS.DOCTOR,
        STATIONS.PHARMACY,
        STATIONS.DISCHARGE
    ],

    // 🟡 ESI-3: Standard Care (Full Workup)
    // The "Assembly Line" flow
    3: [
        STATIONS.VISION,
        STATIONS.DOCTOR,
        STATIONS.PHARMACY,
        STATIONS.DISCHARGE
    ],

    // 🟢 ESI-4: Refraction / Simple
    // Often handled by Optom, Doctor optional
    4: [
        STATIONS.VISION,
        STATIONS.PHARMACY,
        STATIONS.DISCHARGE
    ],

    // 🔵 ESI-5: Admin / Pharmacy Only
    5: [
        STATIONS.PHARMACY,
        STATIONS.DISCHARGE
    ]
};

export function getPathwayForESI(esiLevel) {
    return PATHWAYS[esiLevel] || PATHWAYS[3]; // Default to Standard if unknown
}
