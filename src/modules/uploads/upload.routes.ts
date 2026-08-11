import { Router } from 'express';
import { body } from 'express-validator';
import { UploadController } from './upload.controller';
import { validate } from '../../shared/middleware/validate';

const router = Router();
const controller = new UploadController();

router.post(
  '/image',
  [body('data').notEmpty().withMessage('Image data is required')],
  validate,
  controller.createImage,
);

export { router as uploadRoutes };