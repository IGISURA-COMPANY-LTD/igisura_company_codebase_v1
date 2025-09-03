// routes/blog.js
import express from 'express';
import {
  getAllBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostBySlug
} from '../controllers/blog.controller.js';
import { adminAuth } from '../middleware/auth.js';
import validate from '../middleware/validation.js';
import { blogSchema, blogQuerySchema } from '../validations/index.js';
import { uploadBlogImage, handleUploadErrors, processUploadedBlogImage } from '../middleware/upload.js';
import { uploadBlogImage as uploadHandler } from '../controllers/blog.controller.js';

const router = express.Router();

// Public routes
router.get('/', validate(blogQuerySchema, 'query'), getAllBlogPosts);
router.get('/slug/:slug', getBlogPostBySlug);
router.get('/:idOrSlug', getBlogPost);

// Admin routes
router.post('/upload-image', 
  adminAuth,
  uploadBlogImage,
  handleUploadErrors,
  processUploadedBlogImage,
  uploadHandler
);

router.post('/', adminAuth, validate(blogSchema), createBlogPost);
router.put('/:id', adminAuth, validate(blogSchema), updateBlogPost);
router.delete('/:id', adminAuth, deleteBlogPost);

export default router;