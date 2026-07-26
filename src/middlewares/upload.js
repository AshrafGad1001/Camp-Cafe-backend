const multer = require('multer');

// Use memory storage — files stay in buffer (not saved to disk)
// We upload the buffer directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max (client should compress before upload)
  },
});

module.exports = upload;
