import { Router } from 'express';
import { body } from 'express-validator';
import { UploadController } from './upload.controller';
import { authenticate, authorize } from '../../shared/middleware/authenticate';
import { validate } from '../../shared/middleware/validate';

const router = Router();
const controller = new UploadController();

// Public — stream a stored image to any client (buyer apps, web, etc.)
router.get('/image/:id', controller.getImage);

// Authenticated — only sellers/admins may upload images
router.post(
  '/image',
  authenticate,
  authorize('seller', 'admin'),
  [body('data').notEmpty().withMessage('Image data is required')],
  validate,
  controller.createImage,
);

export { router as uploadRoutes };
