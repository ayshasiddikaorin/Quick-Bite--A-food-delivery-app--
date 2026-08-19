import { Router } from 'express';
import { query } from 'express-validator';
import { GeocodeController } from './geocode.controller';
import { GeocodeService } from './geocode.service';
import { validate } from '../../shared/middleware/validate';

const router = Router();
const controller = new GeocodeController(new GeocodeService());

// Public — reverse geocode a coordinate into an address (free, no API key).
router.get(
  '/reverse',
  [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    query('lon').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  ],
  validate,
  controller.reverse,
);

// Public — search for a place/address by free-text query.
router.get(
  '/search',
  [query('q').notEmpty().withMessage('Query is required')],
  validate,
  controller.search,
);

export { router as geocodeRoutes };