import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'patients.json');

// Helper to read DB
function readDb() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Database read error:", err);
        return [];
    }
}

export const db = {
    // Find patient by phone (Simulates Login)
    getPatientByPhone: (phone) => {
        // Normalize phone (remove spaces)
        const cleanPhone = phone.replace(/\s+/g, '');
        const patients = readDb();
        return patients.find(p => p.phone === cleanPhone) || null;
    },

    // Find patient by ID
    getPatientById: (id) => {
        const patients = readDb();
        return patients.find(p => p.id === id) || null;
    }
};
