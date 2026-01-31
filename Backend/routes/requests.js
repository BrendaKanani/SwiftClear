const express = require('express');
const admin = require('firebase-admin');

module.exports = (db, notifyStudent) => {
  const router = express.Router();

  // Helper for consistent server timestamps
  const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

  // 1. CREATE or RESTORE REQUEST
  router.post('/', async (req, res) => {
    try {
      const { studentId, name, regNo, email, phone, files = [], departments } = req.body;
      
      if (!studentId || !name || !regNo) {
        return res.status(400).json({ message: 'Missing required fields (studentId, name, regNo)' });
      }

      // 1. Check if an active request already exists for this Reg No
      const existingSnap = await db.collection('clearanceRequests')
        .where('regNo', '==', regNo)
        .get();

      // If found, return the existing one (Smart Restore)
      if (!existingSnap.empty) {
        const doc = existingSnap.docs[0];
        console.log(`♻️ Restored existing request for ${regNo}`);
        return res.status(200).json({ 
            id: doc.id, 
            data: doc.data(), 
            message: 'Request already exists. Session restored.' 
        });
      }

      // 2. Define Departments
      // Use provided list OR fall back to the standard university list
      const targetDepts = departments && departments.length > 0
        ? departments
        : ['Finance', 'Library', 'Registrar', 'SportsWelfare', 'Dean', 'Department'];

      // 3. Initialize Department Statuses
      const clearanceMap = {};
      targetDepts.forEach(d => { 
          clearanceMap[d] = { status: 'Pending', remarks: '', updatedAt: new Date().toISOString() }; 
      });

      // 4. Construct the Document
      const newDoc = {
        studentId, name, regNo, 
        email: email || null,
        phone: phone || null,
        files, 
        clearance: clearanceMap,
        settings: { emailAlerts: true, smsAlerts: true }, // Default prefs
        overallStatus: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // 5. Save to Firestore
      const ref = await db.collection('clearanceRequests').add(newDoc);
      const savedDoc = await ref.get();
      
      // 6. Send Welcome Email
      if (notifyStudent && email) {
          notifyStudent(ref.id, "Clearance Process Started", 
            `Hello ${name}, your graduation clearance process has officially started. You can track your progress on the portal.`);
      }

      console.log(`✅ Created new clearance request: ${ref.id}`);
      return res.status(201).json({ id: ref.id, data: savedDoc.data() });

    } catch (err) {
      console.error("Create Request Error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // 2. GET ALL REQUESTS (For Admin/Staff)
  router.get('/', async (req, res) => {
    try {
      const snapshot = await db.collection('clearanceRequests')
        .orderBy('createdAt', 'desc') 
        .get();

      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(requests);

    } catch (err) {
      console.error("Fetch Requests Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 3. GET SINGLE REQUEST
  router.get('/:id', async (req, res) => {
    try {
      const doc = await db.collection('clearanceRequests').doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ message: 'Request Not found' });
      
      res.json({ id: doc.id, data: doc.data() });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. UPDATE DEPARTMENT STATUS (Approve/Reject)
  router.put('/:id/department', async (req, res) => {
    try {
      const { department, status, remarks = '', staffName = 'Staff' } = req.body;
      const requestId = req.params.id;

      const ref = db.collection('clearanceRequests').doc(requestId);
      const snap = await ref.get();
      
      if (!snap.exists) return res.status(404).json({ message: 'Request not found' });

      const data = snap.data();
      const clearance = data.clearance || {};
      
      // Update the specific department
      clearance[department] = { 
          status, 
          remarks, 
          staffName, 
          updatedAt: new Date().toISOString() // Use ISO string for easier frontend parsing
      };

      // Calculate Overall Status
      const allStatuses = Object.values(clearance).map(c => c.status);
      let overallStatus = 'Pending';

      if (allStatuses.every(s => s === 'Approved')) {
          overallStatus = 'Approved';
      } else if (allStatuses.some(s => s === 'Rejected')) {
          overallStatus = 'Rejected'; // Only strictly rejected if one dept says NO
      } 
      // Otherwise it remains 'Pending'

      // Update Database
      await ref.update({ 
          clearance, 
          overallStatus, 
          updatedAt: serverTimestamp() 
      });

      // TRIGGER EMAIL NOTIFICATION
      if (notifyStudent) {
          console.log(`📡 Triggering notification for ${requestId}: ${status}`);
          
          let subject = `Clearance Update: ${department}`;
          let message = "";

          if (status === 'Approved') {
            message = `Good news! The ${department} department has APPROVED your clearance.`;
            // Check if totally finished
            if (overallStatus === 'Approved') {
                subject = "🎉 Clearance Complete!";
                message += " You are now fully cleared by all departments.";
            }
          } else if (status === 'Rejected') {
            subject = `⚠️ Action Required: ${department}`;
            message = `Your clearance for ${department} was REJECTED.\n\nReason: "${remarks}"\n\nPlease visit the office or contact them.`;
          } else {
            message = `Your status for ${department} is now ${status}.`;
          }

          notifyStudent(requestId, subject, message);
      }

      return res.json({ message: 'Updated successfully', overallStatus });

    } catch (err) {
      console.error("Update Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 5. DELETE REQUEST (Admin Only)
  router.delete('/:id', async (req, res) => {
    try {
      await db.collection('clearanceRequests').doc(req.params.id).delete();
      res.json({ message: 'Request deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};