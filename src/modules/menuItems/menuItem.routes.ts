import { Router } from 'express';
import { body } from 'express-validator';
import { MenuItemController } from './menuItem.controller';
import { MenuItemService } from './menuItem.service';
import { MenuItemRepository } from './menuItem.repository';
import { RestaurantRepository } from '../restaurants/restaurant.repository';
import { authenticate, authorize } from '../../shared/middleware/authenticate';
import { validate } from '../../shared/middleware/validate';

const router = Router();
const controller = new MenuItemController(
  new MenuItemService(new MenuItemRepository(), new RestaurantRepository()),
);

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/restaurant/:restaurantId', controller.getByRestaurant);
router.get('/:id', controller.getById);

// ── Seller ────────────────────────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('seller'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  validate,
  controller.create,
);

router.patch('/:id', authenticate, authorize('seller'), controller.update);
router.patch('/:id/toggle', authenticate, authorize('seller'), controller.toggleAvailability);
router.delete('/:id', authenticate, authorize('seller'), controller.delete);

export { router as menuItemRoutes };
