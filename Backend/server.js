require('dotenv').config();
const bcrypt = require('bcryptjs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// CONFIGURATION & CREDENTIALS 
const path = require('path');

// Check if we are running on Render (Production) or Local
const isProduction = process.env.NODE_ENV === 'production';

// On Render, the secret file is placed in the current folder.
// Locally, it is one folder up.
const serviceAccountPath = isProduction 
    ? './serviceAccount.json' 
    : '../serviceAccount.json';

const serviceAccount = require(serviceAccountPath);

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com` // Auto-detect bucket
});

const db = admin.firestore();
const storage = admin.storage().bucket();

const app = express();

// MIDDLEWARE
app.use(helmet());
app.use(cors()); // Allow all origins (Dev mode)
app.use(express.json({ limit: '10mb' }));

// Debug Logger
app.use((req, res, next) => {
    console.log(`👉 ${req.method} ${req.url}`);
    next();
});

// 3. EMAIL NOTIFICATION SYSTEM
const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'brendacarey540@gmail.com',
    pass: process.env.EMAIL_PASS || 'qenc apla wjkm xvhe'
  }
});

// Helper: Send Email
const notifyStudent = async (studentId, subject, message) => {
  try {
    const studentDoc = await db.collection('clearanceRequests').doc(studentId).get();
    if (!studentDoc.exists) return;

    const student = studentDoc.data();
    const prefs = student.settings || { emailAlerts: true };

    if (prefs.emailAlerts && student.email) {
      console.log(`📧 Sending Email to ${student.email}...`);
      await mailTransporter.sendMail({
        from: '"DeKUT Clearance" <no-reply@dekut.ac.ke>',
        to: student.email,
        subject: subject,
        text: message,
        html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
                 <h2 style="color: #006400;">DeKUT Clearance Update</h2>
                 <p>${message}</p>
                 <hr/>
                 <small>This is an automated notification.</small>
               </div>`
      });
    }
  } catch (err) {
    console.error("❌ Notification Error:", err.message);
  }
};

// AUTH ROUTES (Staff & Student)

// STAFF LOGIN
app.post('/api/auth/staff-login', async (req, res) => {
  console.log("🔐 Staff Login Attempt:", req.body.email);
  try {
    const { email, password } = req.body;
    const doc = await db.collection('staff').doc(email).get();

    if (!doc.exists) return res.status(401).json({ message: "User not found" });

    const userData = doc.data();
    const isMatch = await bcrypt.compare(password, userData.password);
    
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      success: true,
      name: userData.name,
      department: userData.department,
      role: userData.role 
    });
  } catch (err) {
    console.error("Staff Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL STAFF (For Admin Dashboard)
app.get('/api/staff', async (req, res) => {
  try {
    const snapshot = await db.collection('staff').get();
    const staffList = snapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data, password: null }; // Security: Hide hash
    });
    res.json(staffList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// STUDENT LOGIN
app.post('/api/auth/student-login', async (req, res) => {
  try {
    const { regNo, password } = req.body;

    // Check Maintenance Mode
    const configDoc = await db.collection('system').doc('config').get();
    if (configDoc.exists && configDoc.data().maintenanceMode) {
      return res.status(503).json({ message: "System is under maintenance" });
    }

    // Sanitize ID
    const studentId = regNo.replace(/\//g, '-');
    const doc = await db.collection('students').doc(studentId).get();

    if (!doc.exists) {
      return res.status(401).json({ message: "Student record not found in Registry." });
    }

    const studentData = doc.data();
    const isMatch = await bcrypt.compare(password, studentData.password);

    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    console.log(`✅ Student Login: ${studentData.name}`);
    
    return res.json({
      success: true,
      studentName: studentData.name,
      regNo: studentData.regNo,
      studentDept: studentData.department,
      email: studentData.email
    });

  } catch (err) {
    console.error("Student Login Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// 5. FEATURE ROUTES

// Core Features
app.use('/api/requests', require('./routes/requests')(db, notifyStudent));
app.use('/api/bookings', require('./routes/bookings')(db));
app.use('/api/mpesa', require('./routes/mpesa')(db));

// File Uploads (Using Signed URLs approach)
app.use('/api/upload', require('./routes/upload')(storage));

// SYSTEM & SETTINGS ROUTES

// GET Settings
app.get('/api/settings', async (req, res) => {
  try {
    const doc = await db.collection('system').doc('config').get();
    res.json(doc.exists ? doc.data() : { 
        maintenanceMode: false, 
        allowRegistration: true, 
        academicYear: "2024/2025" 
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// UPDATE Settings (Admin)
app.post('/api/settings', async (req, res) => {
  try {
    await db.collection('system').doc('config').set({
        ...req.body,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    res.json({ success: true, message: "Settings updated" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// UPDATE Settings (Student)
app.post('/api/student/settings', async (req, res) => {
  try {
    const { studentId, emailAlerts } = req.body;
    await db.collection('clearanceRequests').doc(studentId).set({
        settings: { emailAlerts } 
    }, { merge: true });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Test Email
app.post('/api/test-notif', async (req, res) => {
    try {
        await notifyStudent("TEST_ID", "Test Notification", "This is a test email from the server.");
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 7. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));