const multer = require('multer');
const FileType = require('file-type');

// Use memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Basic header check, we will strictly verify using magic bytes later
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
    fileSize: 5 * 1024 * 1024,
  },
});

const checkMagicBytes = async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const fileTypeResult = await FileType.fromBuffer(req.file.buffer);
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!fileTypeResult || !allowedMimeTypes.includes(fileTypeResult.mime)) {
      return res.status(400).json({ success: false, message: 'Invalid image format detected. Only JPEG, PNG, and WebP are allowed.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error checking file format.' });
  }
};

module.exports = { upload, checkMagicBytes };
