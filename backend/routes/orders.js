// routes/orders.js
import express from 'express';
import {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getUserOrders,
  getOrderStats
} from '../controllers/order.controller.js';
import { auth, adminAuth } from '../middleware/auth.js';
import validate from '../middleware/validation.js';
import { orderSchema, orderQuerySchema, orderStatusSchema } from '../validations/index.js';


const router = express.Router();

// Protected routes
router.post('/', auth, validate(orderSchema), createOrder);


router.get('/', auth, validate(orderQuerySchema, 'query'), getAllOrders);
router.get('/stats', adminAuth, getOrderStats);
router.get('/user/:id', auth, validate(orderQuerySchema, 'query'), getUserOrders);
router.get('/:id', auth, getOrder);

// Admin only routes
router.patch('/:id/status', adminAuth, validate(orderStatusSchema), updateOrderStatus);
router.delete('/:id', adminAuth, deleteOrder);

export default router;