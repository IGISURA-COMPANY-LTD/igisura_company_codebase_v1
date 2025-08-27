// routes/auth.js
import express from 'express';
import { register, login,updateProfile, changePassword, getProfile  } from '../controllers/auth.controller.js';
import validate from '../middleware/validation.js';
import { auth } from '../middleware/auth.js';

import { loginSchema, userSchema, userUpdateSchema } from '../validations/index.js';

const router = express.Router();

router.post('/register', validate(userSchema), register);
router.post('/login',validate(loginSchema), login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, validate(userUpdateSchema), updateProfile);
router.patch('/password', auth, changePassword)

export default router;