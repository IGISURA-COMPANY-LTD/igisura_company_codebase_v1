// routes/categories.js
import express from 'express';
import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
import { adminAuth } from '../middleware/auth.js';
import validate from '../middleware/validation.js';
import { categorySchema } from '../validations/index.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:idOrSlug', getCategory);
router.post('/', adminAuth, validate(categorySchema), createCategory);
router.put('/:id', adminAuth, validate(categorySchema), updateCategory);
router.delete('/:id', adminAuth, deleteCategory);

export default router;