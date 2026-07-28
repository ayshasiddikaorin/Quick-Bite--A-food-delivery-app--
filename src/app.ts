import 'reflect-metadata'; // required once, before any tsyringe decorator is used
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';

import { orderRoutes } from './modules/orders/presentation/order.routes';
import { registerOrderDependencies } from './modules/orders/order.container';
import { registerOrderNotificationListener } from './modules/orders/application/order-notification.listener';
import { errorHandler } from './shared/middleware/error-handler';

export function createApp() {
  // 1. Wire DI bindings for every module (interfaces -> concrete implementations)
  registerOrderDependencies();

  // 2. Register event listeners — decoupled reactions to domain events
  registerOrderNotificationListener();

  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(mongoSanitize());

  // 3. Mount routes — versioned from day one
  app.use('/api/v1/orders', orderRoutes);

  // 4. Error handler MUST be registered last
  app.use(errorHandler);

  return app;
}
