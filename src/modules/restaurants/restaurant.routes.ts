import { Router } from 'express';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { RestaurantRepository } from './restaurant.repository';
import { UserRepository } from '../users/user.repository';
import { authenticate, authorize } from '../../shared/middleware/authenticate';

const router = Router();
const controller = new RestaurantController(
  new RestaurantService(new RestaurantRepository(), new UserRepository()),
);

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', controller.listApproved);
router.get('/:id', controller.getById);

// ── Seller ────────────────────────────────────────────────────────────────────
router.get('/seller/me', authenticate, authorize('seller'), controller.getMyRestaurant);
router.post('/', authenticate, authorize('seller'), controller.create);
router.patch('/seller/me', authenticate, authorize('seller'), controller.update);
router.patch('/seller/me/toggle-open', authenticate, authorize('seller'), controller.toggleOpen);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get('/admin/all', authenticate, authorize('admin'), controller.listAll);
router.patch('/admin/:id/approve', authenticate, authorize('admin'), controller.approve);

export { router as restaurantRoutes };
