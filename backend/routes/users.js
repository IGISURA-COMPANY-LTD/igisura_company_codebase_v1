// routes/users.js
import express from 'express';
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller.js';
import { adminAuth } from '../middleware/auth.js';
import validate from '../middleware/validation.js';
import { userSchema, userUpdateSchema, userQuerySchema } from '../validations/index.js';

const router = express.Router();

router.get('/', adminAuth, validate(userQuerySchema, 'query'), getAllUsers);
router.get('/:id', adminAuth, getUser);
router.post('/', adminAuth, validate(userSchema), createUser);
router.put('/:id', adminAuth, validate(userUpdateSchema), updateUser);
router.delete('/:id', adminAuth, deleteUser);

export default router;