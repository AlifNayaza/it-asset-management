// File: backend/src/routes/locations.routes.js
import { Router } from 'express';
import { getLocations, createLocation } from '../controllers/locations.controller.js';

const router = Router();
router.get('/', getLocations);
router.post('/', createLocation);

export default router;
