import { Router } from 'express';
import { RiderController } from './rider.controller';
import { RiderService } from './rider.service';
import { RiderRepository } from './rider.repository';
import { UserRepository } from '../users/user.repository';
import { OrderRepository } from '../orders/order.repository';
import { authenticate, authorize } from '../../shared/middleware/authenticate';

const router = Router();
const controller = new RiderController(
  new RiderService(new RiderRepository(), new UserRepository(), new OrderRepository()),
);

// ── Rider ─────────────────────────────────────────────────────────────────────
router.post('/profile/ensure', authenticate, authorize('rider'), controller.ensureProfile);
router.get('/profile', authenticate, authorize('rider'), controller.getProfile);
router.patch('/profile/toggle-online', authenticate, authorize('rider'), controller.toggleOnline);
router.get('/delivery-history', authenticate, authorize('rider'), controller.getDeliveryHistory);
router.get('/earnings', authenticate, authorize('rider'), controller.getEarnings);
router.get('/stats', authenticate, authorize('rider'), controller.getStats);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get('/admin/all', authenticate, authorize('admin'), controller.listAll);

export { router as riderRoutes };
