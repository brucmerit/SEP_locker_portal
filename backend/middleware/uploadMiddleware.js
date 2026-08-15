const multer = require('multer');
const fs = require('fs');
const path = require('path');

const heroDir = path.join(__dirname, '..', 'uploads', 'hero');

// Make sure the folder exists before multer tries to save into it
if (!fs.existsSync(heroDir)) {
  fs.mkdirSync(heroDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Only ever keep one hero image - clear out the old one first
    fs.readdirSync(heroDir).forEach(function (existingFile) {
      fs.unlinkSync(path.join(heroDir, existingFile));
    });
    cb(null, heroDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'hero' + ext);
  }
});

function imageFileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed.'));
  }
  cb(null, true);
}

const uploadHero = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

module.exports = uploadHero;
