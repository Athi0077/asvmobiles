import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  searchProductsForBilling,
  createBill,
  getBills,
  getBillById
} from '../controllers/billController.js';

const router = express.Router();

// All billing endpoints require admin / cashier authentication
router.use(protect, adminOnly);

router.get('/search-products', searchProductsForBilling);
router.route('/')
  .get(getBills)
  .post(createBill);

router.get('/:id', getBillById);

export default router;
