// middleware/uploadMiddleware.js
import { upload, uploadBlog } from '../config/cloudinary.js';
import multer from 'multer';

export const uploadProductImages = upload.array('images', 5); // Max 5 images

export const uploadBlogImage = uploadBlog.single('image');
export const uploadBlogImages = uploadBlog.array('images', 5);

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

export const processUploadedBlogImage = (req, res, next) => {
  if (!req.file) return next();
  req.body.image = req.file.path;
  next();
};

export const processUploadedBlogImages = (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();
  req.body.images = req.files.map(file => file.path);
  next();
};