// File: backend/src/routes/assignments.routes.js
import { Router } from 'express';
import {
  checkoutAsset,
  checkinAsset,
  getAssignments
} from '../controllers/assignments.controller.js';

const router = Router();

router.get('/', getAssignments);
router.post('/checkout', checkoutAsset);
router.put('/:id/checkin', checkinAsset);

export default router;
