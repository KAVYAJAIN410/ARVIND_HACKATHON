const { db } = require('./lib/db');

const phone = "9876543210";
const patient = db.getPatient(phone);

console.log("Searching for:", phone, typeof phone);
if (patient) {
    console.log("Found:", patient.name);
} else {
    console.log("NOT FOUND");
}

const phoneNum = 9876543210;
const patientNum = db.getPatient(phoneNum);
console.log("Searching for (number):", phoneNum, typeof phoneNum);
if (patientNum) {
    console.log("Found:", patientNum.name);
} else {
    console.log("NOT FOUND checks strict equality");
}
