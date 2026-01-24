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
    console.error("   Please download it from Firebase Console -> Project Settings -> Service Accounts.");
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

// 4. STAFF DATA
const staffMembers = [
    // --- Admin Level ---
    { email: "registrar@dekut.ac.ke", password: "pass", name: "University Registrar", department: "Registrar", role: "admin" },

    // --- Clearance Offices ---
    { email: "finance@dekut.ac.ke", password: "pass", name: "Jane Finance", department: "Finance", role: "staff" },
    { email: "lib@dekut.ac.ke", password: "pass", name: "John Librarian", department: "Library", role: "staff" },
    { email: "sports@dekut.ac.ke", password: "pass", name: "Coach K", department: "SportsWelfare", role: "staff" },
    

    // --- Academic Departments (CODs) ---
    { email: "cod.cs@dekut.ac.ke", password: "pass", name: "Dr. Computer Science", department: "Computer Science", role: "staff" },
    { email: "cod.it@dekut.ac.ke", password: "pass", name: "Dr. IT", department: "Information Technology", role: "staff" },
    { email: "cod.nursing@dekut.ac.ke", password: "pass", name: "Mary Nursing", department: "Nursing", role: "staff" },
    { email: "cod.eng@dekut.ac.ke", password: "pass", name: "Eng. Kamau", department: "Engineering", role: "staff" },
    { email: "cod.business@dekut.ac.ke", password: "pass", name: "Dr. Biz", department: "Business", role: "staff" },
    
];

// 5. SEEDING FUNCTION
async function seed() {
    console.log("\n🌱 Starting Seeding Process...\n");

    try {
        const batch = db.batch(); // Use batch for atomic writes (faster)
        let count = 0;

        for (const staff of staffMembers) {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(staff.password, salt);

            // Create secure object
            const userObj = {
                ...staff,
                password: hashedPassword,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            const docRef = db.collection('staff').doc(staff.email);
            batch.set(docRef, userObj);
            
            console.log(`   ➕ Prepared: ${staff.department.padEnd(20)} | ${staff.email}`);
            count++;
        }

        console.log(`\n💾 Committing ${count} records to database...`);
        await batch.commit();
        
        console.log("\n✅ SUCCESS: Database seeded successfully!");
        console.log("   Login with Email: <email_from_above> and Password: 'pass'");

    } catch (error) {
        console.error("\n❌ FATAL ERROR:", error);
    } finally {
        process.exit();
    }
}

// Run
seed();