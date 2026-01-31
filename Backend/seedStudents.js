const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// 1. CONFIGURATION
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../serviceAccount.json');
const USE_EMULATOR = false; // Set to FALSE if seeding production DB

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

// 4. STUDENT DATA (Expanded List)
const students = [
    // --- COMPUTER SCIENCE ---
    { regNo: "C026-01-1234/2021", password: "pass", name: "John Doe", email: "john@students.dekut.ac.ke", department: "Computer Science" },
    { regNo: "C026-01-2222/2021", password: "pass", name: "Grace Hopper", email: "grace@students.dekut.ac.ke", department: "Computer Science" },
    { regNo: "C026-01-3333/2021", password: "pass", name: "Alan Turing", email: "alan@students.dekut.ac.ke", department: "Computer Science" },
    { regNo: "C026-01-4444/2021", password: "pass", name: "Ada Lovelace", email: "ada@students.dekut.ac.ke", department: "Computer Science" },

    // --- NURSING ---
    { regNo: "N001-02-5678/2021", password: "pass", name: "Alice Nurse", email: "alice@students.dekut.ac.ke", department: "Nursing" },
    { regNo: "N001-02-1111/2021", password: "pass", name: "Ben Carson", email: "ben@students.dekut.ac.ke", department: "Nursing" },
    { regNo: "N001-02-9999/2021", password: "pass", name: "Florence Nightingale", email: "flo@students.dekut.ac.ke", department: "Nursing" },
    
    // --- ENGINEERING ---
    { regNo: "E030-03-9012/2021", password: "pass", name: "Eng. Kamau", email: "kamau@students.dekut.ac.ke", department: "Engineering" },
    { regNo: "E030-03-5555/2021", password: "pass", name: "Elon Musk", email: "elon@students.dekut.ac.ke", department: "Engineering" },
    { regNo: "E030-03-6666/2021", password: "pass", name: "Nikola Tesla", email: "nikola@students.dekut.ac.ke", department: "Engineering" },
    { regNo: "E030-03-7777/2021", password: "pass", name: "Henry Ford", email: "henry@students.dekut.ac.ke", department: "Engineering" },

    // --- BUSINESS ---
    { regNo: "B015-04-3456/2021", password: "pass", name: "Rose Biz", email: "rose@students.dekut.ac.ke", department: "Business" },
    { regNo: "B015-04-1212/2021", password: "pass", name: "Warren Buffet", email: "warren@students.dekut.ac.ke", department: "Business" },
    { regNo: "B015-04-1313/2021", password: "pass", name: "Oprah Winfrey", email: "oprah@students.dekut.ac.ke", department: "Business" },

    // --- INFORMATION TECHNOLOGY ---
    { regNo: "C025-05-1111/2021", password: "pass", name: "Ian Tech", email: "ian@students.dekut.ac.ke", department: "Information Technology" },
    { regNo: "C025-05-2222/2021", password: "pass", name: "Linus Torvalds", email: "linus@students.dekut.ac.ke", department: "Information Technology" },
    { regNo: "C025-05-3333/2021", password: "pass", name: "Tim Berners-Lee", email: "tim@students.dekut.ac.ke", department: "Information Technology" }
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

            console.log(`   👤 Prepared: ${student.name.padEnd(20)} | ${studentId}`);
            count++;
        }

        console.log(`\n💾 Committing ${count} student records...`);
        await batch.commit();

        console.log("\n✅ SUCCESS: Student Registry Mocked!");
        console.log("   You can now log in with any of the RegNos listed above.");
        console.log("   Default Password for all: 'pass'");

    } catch (error) {
        console.error("\n❌ FATAL ERROR:", error);
    } finally {
        process.exit();
    }
}

seedStudents();