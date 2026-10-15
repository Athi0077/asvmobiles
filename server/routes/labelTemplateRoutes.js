import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getLabelTemplates,
  getLabelTemplateById,
  createLabelTemplate,
  updateLabelTemplate,
  deleteLabelTemplate,
} from '../controllers/labelTemplateController.js';

const router = express.Router();

router.use(protect, adminOnly);

router.route('/')
  .get(getLabelTemplates)
  .post(createLabelTemplate);

router.route('/:id')
  .get(getLabelTemplateById)
  .put(updateLabelTemplate)
  .delete(deleteLabelTemplate);

export default router;
