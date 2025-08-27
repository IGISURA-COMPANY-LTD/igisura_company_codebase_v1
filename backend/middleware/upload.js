// middleware/uploadMiddleware.js
import { upload } from '../config/cloudinary.js';

export const uploadProductImages = upload.array('images', 5); // Max 5 images

export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 5 images.' });
    }
  }
  
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: 'Only image files are allowed' });
  }

  next(err);
};

export const processUploadedImages = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  // Extract Cloudinary URLs from uploaded files
  req.body.images = req.files.map(file => file.path);
  next();
};