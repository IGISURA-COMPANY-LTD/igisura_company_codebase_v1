// routes/products.js
import express from 'express';
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  uploadProductImages
} from '../controllers/product.controller.js';
import { adminAuth } from '../middleware/auth.js';
import validate from '../middleware/validation.js';
import { productSchema, productQuerySchema } from '../validations/index.js';
import { uploadProductImages as uploadMiddleware, handleUploadErrors, processUploadedImages } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', validate(productQuerySchema, 'query'), getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:categoryIdOrSlug', validate(productQuerySchema, 'query'), getProductsByCategory);
router.get('/:idOrSlug', getProduct);

// Image upload route
router.post('/upload-images', 
  adminAuth,
  uploadMiddleware,
  handleUploadErrors,
  processUploadedImages,
  uploadProductImages
);

// Admin routes with image upload support
router.post('/', 
  adminAuth,
  uploadMiddleware,
  handleUploadErrors,
  processUploadedImages,
  validate(productSchema),
  createProduct
);

router.put('/:id', 
  adminAuth,
  uploadMiddleware,
  handleUploadErrors,
  processUploadedImages,
  validate(productSchema),
  updateProduct
);

router.delete('/:id', adminAuth, deleteProduct);

export default router;