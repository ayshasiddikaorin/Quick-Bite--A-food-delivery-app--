import { Router } from 'express';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserRepository } from '../users/user.repository';
import { RestaurantRepository } from '../restaurants/restaurant.repository';
import { OrderRepository } from '../orders/order.repository';
import { RiderRepository } from '../riders/rider.repository';
import { authenticate, authorize } from '../../shared/middleware/authenticate';

const router = Router();
const controller = new AdminController(
  new AdminService(
    new UserRepository(),
    new RestaurantRepository(),
    new OrderRepository(),
    new RiderRepository(),
  ),
);

router.get('/stats', authenticate, authorize('admin'), controller.getPlatformStats);

export { router as adminRoutes };
