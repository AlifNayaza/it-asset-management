// File: backend/src/routes/reports.routes.js
import { Router } from 'express';
import {
  getDepreciationReport,
  getDashboardSummary
} from '../controllers/reports.controller.js';

const router = Router();

router.get('/depreciation', getDepreciationReport);
router.get('/summary', getDashboardSummary);

export default router;
