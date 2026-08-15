const fs = require('fs');
const path = require('path');

const heroDir = path.join(__dirname, '..', 'uploads', 'hero');

// GET /api/upload/hero - returns the URL of the current hero image, or null
// if nobody has uploaded one yet (front-end falls back to a default look)
function getHeroImage(req, res) {
  if (!fs.existsSync(heroDir)) {
    return res.json({ imageUrl: null });
  }

  const files = fs.readdirSync(heroDir);
  if (files.length === 0) {
    return res.json({ imageUrl: null });
  }

  // uploadMiddleware.js only ever keeps one file in this folder
  res.json({ imageUrl: '/uploads/hero/' + files[0] });
}

// POST /api/upload/hero - by the time we get here, uploadMiddleware.js
// (multer) has already saved the file to disk
function uploadHeroImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file received.' });
  }
  res.status(201).json({ imageUrl: '/uploads/hero/' + req.file.filename });
}

module.exports = { getHeroImage, uploadHeroImage };
