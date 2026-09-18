import express from 'express';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  updateServiceStatus,
  deleteService,
  trackService
} from '../controllers/serviceController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for tracking
router.get('/track/:trackingToken', trackService);

// Admin routes
router.route('/')
  .post(protect, adminOnly, createService)
  .get(protect, adminOnly, getServices);

router.route('/:id')
  .get(protect, adminOnly, getServiceById)
  .put(protect, adminOnly, updateService)
  .delete(protect, adminOnly, deleteService);

router.patch('/:id/status', protect, adminOnly, updateServiceStatus);

export default router;
