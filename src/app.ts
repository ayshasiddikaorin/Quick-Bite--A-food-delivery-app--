import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';

import { userRoutes } from './modules/users/user.routes';
import { restaurantRoutes } from './modules/restaurants/restaurant.routes';
import { menuItemRoutes } from './modules/menuItems/menuItem.routes';
import { offerRoutes } from './modules/offers/offer.routes';
import { orderRoutes } from './modules/orders/order.routes';
import { riderRoutes } from './modules/riders/rider.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { uploadRoutes } from './modules/uploads/upload.routes';
import { errorHandler } from './shared/middleware/errorHandler';
import { ApiResponse } from './shared/dto/ApiResponse';
import mongoose from 'mongoose';

export function createApp() {
  const app = express();

  // ── Security & parsing ─────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '12mb' }));
  app.use(mongoSanitize());

  // ── Uploaded images (served at /uploads/<file>) ────────────────────────────
  app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.use('/api/v1/auth', userRoutes);
  app.use('/api/v1/restaurants', restaurantRoutes);
  app.use('/api/v1/menu-items', menuItemRoutes);
  app.use('/api/v1/offers', offerRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/riders', riderRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/uploads', uploadRoutes);

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Root – backend + DB status
  app.get('/', (req, res) => {
    const dbStates: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    const dbState = mongoose.connection.readyState;
    const dbConnected = dbState === 1;
    const data = {
      message: dbConnected
        ? 'Backend is running and MongoDB is connected'
        : 'Backend is running but MongoDB is not connected',
      database: mongoose.connection.name || null,
      dbState: dbStates[dbState] ?? 'unknown',
      timestamp: new Date().toISOString(),
    };
    res.status(dbConnected ? 200 : 503).json(
      dbConnected
        ? ApiResponse.ok(data, 'Backend running, MongoDB connected')
        : ApiResponse.serverError('Backend running but MongoDB connection failed'),
    );
  });

  // ── Error handler (must be last) ───────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
