// File: backend/src/routes/categories.routes.js
import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categories.controller.js';

const router = Router();
router.get('/', getCategories);
router.post('/', createCategory);

export default router;
