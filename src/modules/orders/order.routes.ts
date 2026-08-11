import { Router } from 'express';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { UserRepository } from '../users/user.repository';
import { RestaurantRepository } from '../restaurants/restaurant.repository';
import { RiderRepository } from '../riders/rider.repository';
import { authenticate, authorize } from '../../shared/middleware/authenticate';

const router = Router();
const controller = new OrderController(
  new OrderService(
    new OrderRepository(),
    new UserRepository(),
    new RestaurantRepository(),
    new RiderRepository(),
  ),
);

// ── Buyer ─────────────────────────────────────────────────────────────────────
router.post('/', authenticate, authorize('buyer'), controller.placeOrder);
router.get('/my', authenticate, authorize('buyer'), controller.getMyOrders);
router.patch('/:id/cancel', authenticate, controller.cancelOrder);

// ── Seller ────────────────────────────────────────────────────────────────────
router.get('/seller', authenticate, authorize('seller'), controller.getRestaurantOrders);
router.get('/seller/stats', authenticate, authorize('seller'), controller.getSellerStats);
router.patch('/seller/:id/advance', authenticate, authorize('seller'), controller.advanceOrderSeller);
router.patch('/seller/:id/pickup', authenticate, authorize('seller'), controller.confirmPickup);

// ── Rider ─────────────────────────────────────────────────────────────────────
router.get('/rider/available', authenticate, authorize('rider'), controller.getRiderAvailableOrders);
router.get('/rider/active', authenticate, authorize('rider'), controller.getRiderActiveOrders);
router.patch('/rider/:id/accept', authenticate, authorize('rider'), controller.acceptDelivery);
router.patch('/rider/:id/advance', authenticate, authorize('rider'), controller.advanceOrderRider);

// ── Buyer ─────────────────────────────────────────────────────────────────────
router.patch('/buyer/:id/received', authenticate, authorize('buyer'), controller.confirmReceived);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get('/admin/all', authenticate, authorize('admin'), controller.getAllOrders);

// ── Shared: get single order ──────────────────────────────────────────────────
router.get('/:id', authenticate, controller.getById);

export { router as orderRoutes };
