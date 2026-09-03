// File: backend/src/routes/maintenance.routes.js
import { Router } from 'express';
import {
  createMaintenanceLog,
  completeMaintenanceLog,
  getMaintenanceLogs
} from '../controllers/maintenance.controller.js';

const router = Router();

router.get('/', getMaintenanceLogs);
router.post('/', createMaintenanceLog);
router.put('/:id/complete', completeMaintenanceLog);

export default router;
