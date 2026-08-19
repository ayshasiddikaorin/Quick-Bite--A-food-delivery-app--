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
import { uploadRoutes } from './modules/uploads/upload.routes';
import { geocodeRoutes } from './modules/geocode/geocode.routes';
import { errorHandler } from './shared/middleware/errorHandler';
import mongoose from 'mongoose';
import { connectDB } from './shared/db/connect';

let connecting: Promise<void> | null = null;

/**
 * Ensure MongoDB is connected before handling a request.
 * Cached across warm invocations so a warm function never re-connects.
 */
export async function ensureDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 1) {
    if (!connecting) {
      connecting = connectDB().finally(() => {
        connecting = null;
      });
    }
    await connecting;
  }
}

export function createApp() {
  const app = express();

  // ── Database (lazy connection for serverless) ─────────────────────────────
  app.use(async (_req, res, next) => {
    try {
      await ensureDatabase();
      next();
    } catch (err) {
      res.status(503).json({
        success: false,
        message: 'Backend running but MongoDB connection failed',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // ── Security & parsing ─────────────────────────────────────────────────────
  // Limit must exceed the largest accepted image when base64-encoded
  // (8MB binary → ~10.7MB base64) plus JSON envelope overhead.
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '16mb' }));
  app.use(mongoSanitize());

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.use('/api/v1/auth', userRoutes);
  app.use('/api/v1/restaurants', restaurantRoutes);
  app.use('/api/v1/menu-items', menuItemRoutes);
  app.use('/api/v1/offers', offerRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/riders', riderRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/uploads', uploadRoutes);
  app.use('/api/v1/geocode', geocodeRoutes);

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Root – lightweight landing page with live MongoDB status
  app.get('/', (_req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.json({
      message: dbConnected
        ? 'Backend is running and MongoDB is connected'
        : 'Backend is running but MongoDB is not connected',
      health: '/health',
      database: dbConnected ? mongoose.connection.name || null : null,
    });
  });

  // ── Error handler (must be last) ───────────────────────────────────────────
  app.use(errorHandler);

  return app;
}

const app = createApp();
export default app;
