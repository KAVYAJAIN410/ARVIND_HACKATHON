import { QueueSystem } from './lib/queueSystem.js';
import { db } from './lib/db.js';
import { PATHWAYS, STATIONS } from './lib/pathways.js';

console.log("=== DIAGNOSTIC START ===");

// 1. Setup
const tokenId = "UNIT-TEST-001";
console.log(`1. Creating Visit for ${tokenId}`);
db.createVisit({
    tokenId,
    patientId: "Test Patient",
    esiLevel: 3,
    timestamp: new Date().toISOString()
});

// 2. Start
console.log("2. Starting Journey (ESI 3)");
QueueSystem.startJourney(tokenId, 3);

const visit = db.getVisit(tokenId);
console.log(`   Current Station: ${visit.currentStation}`);
console.log(`   Pathway Length: ${visit.pathway?.length}`);
console.log(`   Expected Vision: ${STATIONS.VISION}`);

if (visit.currentStation !== STATIONS.VISION) {
    console.error("❌ ERROR: Patient did not start at Vision Test");
    process.exit(1);
}

// 3. Advance
console.log("3. Advancing Patient...");
const result = QueueSystem.advancePatient(tokenId);
console.log("   Result:", JSON.stringify(result));

console.log(`   New Station: ${visit.currentStation}`);
console.log(`   Expected Doctor: ${STATIONS.DOCTOR}`);

if (visit.currentStation === STATIONS.DOCTOR) {
    console.log("✅ SUCCESS: Patient moved to Doctor Consultation");
} else {
    console.error("❌ ERROR: Patient failed to move to Doctor");
    console.log("DEBUG INFO:");
    console.log("Pathway:", visit.pathway);
    console.log("Current Index:", visit.pathway.indexOf(visit.currentStation));
}

console.log("=== DIAGNOSTIC END ===");
