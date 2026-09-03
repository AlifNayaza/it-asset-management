// File: backend/src/routes/assets.routes.js
import { Router } from 'express';
import {
  getAssets,
  getAssetById,
  getAssetQuickView,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetLabel,
  bulkImportAssets
} from '../controllers/assets.controller.js';

const router = Router();

router.get('/', getAssets);
router.post('/bulk-import', bulkImportAssets);
router.post('/', createAsset);
router.get('/:tag/quick-view', getAssetQuickView);
router.get('/:id/label', getAssetLabel);
router.get('/:id', getAssetById);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

export default router;

