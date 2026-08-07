import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';

import { userRoutes } from './modules/users/user.routes';
import { restaurantRoutes } from './modules/restaurants/restaurant.routes';
import { menuItemRoutes } from './modules/menuItems/menuItem.routes';
import { offerRoutes } from './modules/offers/offer.routes';
import { orderRoutes } from './modules/orders/order.routes';
import { riderRoutes } from './modules/riders/rider.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { errorHandler } from './shared/middleware/errorHandler';

export function createApp() {
  const app = express();

  // ── Security & parsing ─────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(mongoSanitize());

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.use('/api/v1/auth', userRoutes);
  app.use('/api/v1/restaurants', restaurantRoutes);
  app.use('/api/v1/menu-items', menuItemRoutes);
  app.use('/api/v1/offers', offerRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/riders', riderRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // ── Error handler (must be last) ───────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
