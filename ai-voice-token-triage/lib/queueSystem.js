import { db } from './db';
import { PATHWAYS, STATIONS } from './pathways';

/**
 * Queue Priority Engine
 * Implements "Sickest First" + "Aging" Fairness
 */

// Priority Weights
const ESI_WEIGHTS = {
    1: 1000, // Emergency
    2: 800,  // Urgent
    3: 500,  // Standard
    4: 200,  // Fast Track
    5: 100   // Admin
};

const AGING_FACTOR = 2; // +2 points per minute of waiting

export const QueueSystem = {
    /**
     * Initialize a patient into the queue system
     */
    startJourney: (tokenId, esiLevel) => {
        const visit = db.getVisit(tokenId);
        if (!visit) return;

        const pathway = PATHWAYS[esiLevel] || PATHWAYS[3];
        const firstStation = pathway[0]; // Usually Registration

        // Update Visit with Flow Data
        visit.pathway = pathway;
        visit.currentStation = firstStation;
        visit.stationStatus = 'waiting';
        visit.entryTime = Date.now();

        // Add to Queue
        QueueSystem.addToStation(firstStation, visit);
    },

    /**
     * Add patient to a specific station queue
     */
    addToStation: (station, visit) => {
        const queueItem = {
            tokenId: visit.tokenId,
            name: visit.patientId, // or name lookup
            esiLevel: visit.esiLevel || 3,
            entryTime: Date.now(),
            baseScore: ESI_WEIGHTS[visit.esiLevel || 3] || 100
        };
        db.addToQueue(station, queueItem);
    },

    /**
     * Get sorted list for a station (The Display Logic)
     */
    getStationQueue: (station) => {
        const queues = db.getQueues();
        const rawList = queues[station] || [];

        // Dynamic Sort
        const now = Date.now();
        return rawList.map(item => {
            const waitMinutes = (now - item.entryTime) / 60000;
            const agingScore = waitMinutes * AGING_FACTOR;
            const totalScore = item.baseScore + agingScore;

            return { ...item, waitMinutes: waitMinutes.toFixed(0), totalScore };
        }).sort((a, b) => b.totalScore - a.totalScore); // High score first
    },

    /**
     * Complete current station and move to next
     */
    advancePatient: (tokenId) => {
        console.log(`[QueueSystem] Advancing ${tokenId}`);
        const visit = db.getVisit(tokenId);
        if (!visit || !visit.pathway) {
            console.error(`[QueueSystem] Visit or Pathway not found for ${tokenId}`);
            return null;
        }

        // Refresh pathway from source of truth to handle HMR/Code updates
        const freshPathway = PATHWAYS[visit.esiLevel || 3] || PATHWAYS[3];
        visit.pathway = freshPathway;

        console.log(`[QueueSystem] Current Station: ${visit.currentStation}`);
        console.log(`[QueueSystem] Pathway:`, visit.pathway);

        const currentIndex = visit.pathway.indexOf(visit.currentStation);
        console.log(`[QueueSystem] Current Index: ${currentIndex}`);

        if (currentIndex === -1 || currentIndex >= visit.pathway.length - 1) {
            console.log(`[QueueSystem] End of line or invalid index`);
            visit.stationStatus = 'completed';
            return { next: null, message: "Journey Completed" };
        }

        const nextStation = visit.pathway[currentIndex + 1];
        console.log(`[QueueSystem] Next Station: ${nextStation}`);

        // 🟢 Remove from current station queue (Fix for duplication)
        db.removeFromQueue(visit.currentStation, tokenId);

        // Move to next
        visit.currentStation = nextStation;
        visit.stationStatus = 'waiting';
        visit.entryTime = Date.now();

        if (nextStation !== STATIONS.DISCHARGE) {
            console.log(`[QueueSystem] Adding to station: ${nextStation}`);
            QueueSystem.addToStation(nextStation, visit);
        }

        return { next: nextStation };
    }
};
