import { Router } from 'express';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { OfferRepository } from './offer.repository';
import { RestaurantRepository } from '../restaurants/restaurant.repository';
import { authenticate, authorize } from '../../shared/middleware/authenticate';

const router = Router();
const controller = new OfferController(
  new OfferService(new OfferRepository(), new RestaurantRepository()),
);

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', controller.getActiveOffers);
router.get('/restaurant/:restaurantId', controller.getByRestaurant);
router.get('/:id', controller.getById);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get('/admin/all', authenticate, authorize('admin'), controller.getAll);

// ── Seller ────────────────────────────────────────────────────────────────────
router.post('/', authenticate, authorize('seller'), controller.create);
router.patch('/:id', authenticate, authorize('seller'), controller.update);
router.delete('/:id', authenticate, authorize('seller'), controller.delete);

export { router as offerRoutes };
