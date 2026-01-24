const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// 1. CONFIGURATION
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../serviceAccount.json');
const USE_EMULATOR = true; // Set to FALSE if seeding production DB

// 2. CHECK CREDENTIALS
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error("❌ ERROR: serviceAccount.json not found in the root backend folder.");
    process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);

// 3. INITIALIZE FIREBASE
if (USE_EMULATOR) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    console.log("🔧 Mode: CONNECTED TO EMULATOR (Localhost)");
} else {
    console.log("⚠️ Mode: CONNECTED TO CLOUD (Real Database)");
}

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// 4. STUDENT DATA
const students = [
    // Computer Science
    { regNo: "C026-01-1234/2021", password: "pass", name: "John Doe", email: "john@students.dekut.ac.ke", department: "Computer Science" },
    
    // Nursing
    { regNo: "N001-02-5678/2021", password: "pass", name: "Alice Nurse", email: "alice@students.dekut.ac.ke", department: "Nursing" },
    
    // Engineering
    { regNo: "E030-03-9012/2021", password: "pass", name: "Eng. Kamau", email: "kamau@students.dekut.ac.ke", department: "Engineering" },
    
    // Business
    { regNo: "B015-04-3456/2021", password: "pass", name: "Rose Biz", email: "rose@students.dekut.ac.ke", department: "Business" },
    
    // Information Technology
    { regNo: "C025-05-1111/2021", password: "pass", name: "Ian Tech", email: "ian@students.dekut.ac.ke", department: "Information Technology" }
];

// 5. SEEDING FUNCTION
async function seedStudents() {
    console.log("\n🎓 Starting Student Registry Seeding...\n");

    try {
        const batch = db.batch();
        let count = 0;

        for (const student of students) {
            // 1. Hash Password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(student.password, salt);

            // 2. Sanitize ID (Firestore keys cannot contain '/')
            const studentId = student.regNo.replace(/\//g, '-');

            // 3. Create Object
            const studentObj = {
                ...student,
                password: hashedPassword,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            const docRef = db.collection('students').doc(studentId);
            batch.set(docRef, studentObj);

            console.log(`   👤 Prepared: ${student.name.padEnd(15)} | ${studentId}`);
            count++;
        }

        console.log(`\n💾 Committing ${count} student records...`);
        await batch.commit();

        console.log("\n✅ SUCCESS: Student Registry Mocked!");
        console.log("   Test Login with RegNo (e.g., C026-01-1234/2021) and Password: 'pass'");

    } catch (error) {
        console.error("\n❌ FATAL ERROR:", error);
    } finally {
        process.exit();
    }
}

seedStudents();