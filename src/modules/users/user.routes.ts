import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { authenticate, authorize } from '../../shared/middleware/authenticate';
import { validate } from '../../shared/middleware/validate';

const router = Router();
const controller = new UserController(new UserService(new UserRepository()));

// ── Public routes ─────────────────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['buyer', 'seller', 'rider']).withMessage('Role must be buyer, seller, or rider'),
  ],
  validate,
  controller.register,
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  controller.login,
);

// ── Authenticated routes ──────────────────────────────────────────────────────
router.get('/me', authenticate, controller.getProfile);
router.patch('/me', authenticate, controller.updateProfile);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/admin/users', authenticate, authorize('admin'), controller.listUsers);
router.patch('/admin/users/:id/toggle', authenticate, authorize('admin'), controller.toggleUser);

export { router as userRoutes };
