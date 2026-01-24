const express = require('express');
const router = express.Router();
const axios = require('axios');

// Middleware to get Token (Standard Safaricom Logic)
const getAccessToken = async (req, res, next) => {
    try {
        const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
        const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
        const response = await axios.get(url, { headers: { Authorization: `Basic ${auth}` } });
        req.accessToken = response.data.access_token;
        next();
    } catch (error) {
        console.error("Token Error:", error.message);
        res.status(401).json({ message: "Auth Failed" });
    }
};

module.exports = (db) => {

    // POST /api/mpesa/pay
    router.post('/pay', getAccessToken, async (req, res) => {
        try {
            const { phoneNumber, studentId, studentName, gownType, gownSize, requestId } = req.body;
            
            // 1. Clean Phone Number (Must be 254...)
            const formattedPhone = phoneNumber.startsWith('0') ? '254' + phoneNumber.slice(1) : phoneNumber;
            
            // 2. Generate Timestamp & Password
            const date = new Date();
            const timestamp = date.getFullYear() +
                ("0" + (date.getMonth() + 1)).slice(-2) +
                ("0" + date.getDate()).slice(-2) +
                ("0" + date.getHours()).slice(-2) +
                ("0" + date.getMinutes()).slice(-2) +
                ("0" + date.getSeconds()).slice(-2);
            
            const password = Buffer.from(process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp).toString('base64');

            // 3. Send Request to Safaricom (Callback URL is dummy/fake because we ignore it)
            const stkUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
            const payload = {
                "BusinessShortCode": process.env.MPESA_SHORTCODE,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": 1, // 1 KES for testing
                "PartyA": formattedPhone,
                "PartyB": process.env.MPESA_SHORTCODE,
                "PhoneNumber": formattedPhone,
                "CallBackURL": "https://mydomain.com/api/callback", // Dummy URL
                "AccountReference": "Clearance",
                "TransactionDesc": "Gown Fee"
            };

            await axios.post(stkUrl, payload, {
                headers: { Authorization: `Bearer ${req.accessToken}` }
            });

            console.log(`📲 STK Push Sent to ${formattedPhone}`);

            // 4. SAVE BOOKING IMMEDIATELY (Assume Success for Demo)
            // In a real app, we would wait, but for a demo, this ensures the flow continues.
            const bookingData = {
                requestId,
                studentId,
                studentName,
                gownType,
                gownSize,
                amount: 2000,
                paymentRef: "MPESA_" + timestamp, // Temporary Ref
                paymentMethod: "M-PESA",
                status: "PAID",
                bookedAt: new Date().toISOString()
            };

            await db.collection('bookings').add(bookingData);
            
            // Update Clearance Request
            await db.collection('clearanceRequests').doc(requestId).set({
                gownIssued: true,
                gownDetails: { type: gownType, size: gownSize }
            }, { merge: true });

            res.json({ success: true, message: "STK Push Sent & Booking Recorded" });

        } catch (error) {
            console.error("M-Pesa Error:", error.response ? error.response.data : error.message);
            res.status(500).json({ message: "Payment Failed" });
        }
    });

    return router;
};