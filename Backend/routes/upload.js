const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = (storageBucket) => {
  const router = express.Router();

  // POST /api/upload (Generate Signed URL for Client-Side Upload)
  router.post('/', async (req, res) => {
    try {
      const { filename, contentType } = req.body;

      // 1. Validate Input
      if (!filename || !contentType) {
        return res.status(400).json({ message: 'Missing filename or contentType' });
      }

      // 2. Create Secure File Path
      // Extract extension (e.g., .pdf)
      const ext = path.extname(filename);
      // Clean the name (remove special chars), keep it readable
      const safeName = path.basename(filename, ext).replace(/[^a-zA-Z0-9-_]/g, '');
      // Combine: UUID + CleanName + Extension
      const finalFilename = `${uuidv4()}_${safeName}${ext}`;
      const storagePath = `clearance_docs/${finalFilename}`;

      const file = storageBucket.file(storagePath);

      // 3. Generate Signed URL
      // This allows the frontend to upload DIRECTLY to Firebase (bypassing the server)
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 60 * 60 * 1000, // Link valid for 1 hour
        contentType: contentType,
      });

      console.log(`🔑 Generated upload URL for: ${finalFilename}`);

      // 4. Return Data
      res.json({ 
        uploadUrl: url, 
        storagePath: storagePath,
        filename: finalFilename 
      });

    } catch (err) {
      console.error("❌ Signed URL Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};