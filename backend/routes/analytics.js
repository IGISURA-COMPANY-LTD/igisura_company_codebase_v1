// routes/analytics.js
import express from 'express';
import {
  getDashboardStats,
  getInventoryAnalytics,
  getRevenueTrend,
  getOrdersTrend
} from '../controllers/analytics.controller.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard/stats', adminAuth, getDashboardStats);
router.get('/dashboard/revenue-trend', adminAuth, getRevenueTrend);
router.get('/dashboard/orders-trend', adminAuth, getOrdersTrend);
// router.get('/analytics/revenue', adminAuth, getRevenueAnalytics);
// router.get('/analytics/sales', adminAuth, getSalesAnalytics);
// router.get('/analytics/customers', adminAuth, getCustomerAnalytics);
router.get('/analytics/inventory', adminAuth, getInventoryAnalytics);

export default router;