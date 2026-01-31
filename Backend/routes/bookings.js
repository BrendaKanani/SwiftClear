const express = require('express');
const admin = require('firebase-admin');

module.exports = (db) => {
  const router = express.Router();

  // Helper for consistent server timestamps
  const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

  // 1. CREATE BOOKING
  router.post('/', async (req, res, next) => {
    try {
      const { requestId, studentId, gownType, gownSize, amount = 0, currency = 'KES', paymentRef = null } = req.body;
      
      // Basic Validation
      if (!requestId || !studentId || !gownType || !gownSize) {
          return res.status(400).json({ message: 'Missing required booking fields' });
      }

      const booking = {
        requestId, 
        studentId, 
        gownType, 
        gownSize, 
        amount, 
        currency, 
        paymentRef,
        // If payment ref exists, mark paid, otherwise pending
        status: paymentRef ? 'PAID' : 'PENDING',
        fine: null, // Initialize empty fine structure
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const ref = await db.collection('gownBookings').add(booking);
      
      console.log(`🎓 Gown booked for Student ${studentId}`);
      res.status(201).json({ id: ref.id, data: booking });

    } catch (err) { 
        next(err); 
    }
  });

  // 2. GET BOOKINGS (List with Filter)
  router.get('/', async (req, res, next) => {
    try {
      let query = db.collection('gownBookings');

      // Filter by Student ID if provided
      if (req.query.studentId) {
        query = query.where('studentId', '==', req.query.studentId);
      }

    
      query = query.orderBy('createdAt', 'desc');

      const snapshot = await query.get();
      
      const bookings = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
      }));
      
      res.json(bookings);
    } catch (err) { 
        next(err); 
    }
  });

  // 3. UPDATE BOOKING (Status / Fines)
  router.patch('/:id', async (req, res, next) => {
    try {
      const { status, fine } = req.body;
      const updateData = { updatedAt: serverTimestamp() };

      // 1. Update Status (e.g. "ISSUED", "RETURNED")
      if (status) {
        updateData.status = status;
      }

      // 2. Handle Fines (Damage or Delay)
      // Structure: { amount: 500, reason: 'Late Return', isPaid: false }
      if (fine) {
        updateData.fine = fine; 
        
        // Auto-update status based on fine state
        if (fine.amount > 0 && !fine.isPaid) {
           updateData.status = 'FINE_PENDING';
        } else if (fine.isPaid && status !== 'RETURNED') {
           // If they paid the fine, and we haven't explicitly set another status
           updateData.status = 'CLEARED';
        }
      }

      await db.collection('gownBookings').doc(req.params.id).update(updateData);
      
      res.json({ 
          success: true, 
          message: 'Booking updated successfully', 
          updatedFields: updateData 
      });

    } catch (err) {
      next(err);
    }
  });

  return router;
};