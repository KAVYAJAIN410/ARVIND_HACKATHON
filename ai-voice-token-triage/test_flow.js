const { QueueSystem } = require('./lib/queueSystem');
const { db } = require('./lib/db');
const { STATIONS } = require('./lib/pathways');

console.log("=== STARTING QUEUE FLOW TEST ===");

// 1. Setup Patient & Visit
const tokenId = "TEST-FLOW-001";
db.createVisit({
    tokenId,
    patientId: "Test Patient",
    esiLevel: 3,
    timestamp: new Date().toISOString()
});

console.log("1. Starting Journey for ESI 3 (Should go to Vision)");
QueueSystem.startJourney(tokenId, 3);

// 2. Check Vision Queue
const visionQueue = QueueSystem.getStationQueue('vision_test');
console.log("   Vision Queue Length:", visionQueue.length);
if (visionQueue.length > 0 && visionQueue[0].tokenId === tokenId) {
    console.log("   ✅ Patient is in Vision Test");
} else {
    console.error("   ❌ Patient NOT in Vision Test");
}

// 3. Advance Patient
console.log("2. Advancing Patient (Should go to Doctor)");
const result = QueueSystem.advancePatient(tokenId);
console.log("   Advance Result:", result);

// 4. Check Doctor Queue
const doctorQueue = QueueSystem.getStationQueue('doctor_consult');
const iopQueue = QueueSystem.getStationQueue('iop_check');

console.log("   Doctor Queue Length:", doctorQueue.length);
console.log("   IOP Queue Length:", iopQueue.length);

if (doctorQueue.length > 0 && doctorQueue[0].tokenId === tokenId) {
    console.log("   ✅ Patient is in Doctor Consult");
} else {
    console.error("   ❌ Patient NOT in Doctor Consult");
    if (iopQueue.length > 0) {
        console.error("   ⚠️  Patient is in IOP Check (Pathway Mismatch?)");
    } else {
        console.error("   ⚠️  Patient is NOWHERE (Lost in transit)");
    }
}

// Debug Visit State
const visit = db.getVisit(tokenId);
console.log("   Current Station in Visit:", visit.currentStation);
