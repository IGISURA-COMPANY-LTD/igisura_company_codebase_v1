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

const router = express.Router();

// Public routes
router.get('/', validate(blogQuerySchema, 'query'), getAllBlogPosts);
router.get('/slug/:slug', getBlogPostBySlug);
router.get('/:idOrSlug', getBlogPost);

// Admin routes
router.post('/', adminAuth, validate(blogSchema), createBlogPost);
router.put('/:id', adminAuth, validate(blogSchema), updateBlogPost);
router.delete('/:id', adminAuth, deleteBlogPost);

export default router;