import express from 'express';
import { config } from './config/app.config';
import { securityMiddleware } from './middlewares/security.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { corsMiddleware } from './middlewares/cors.middleware';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';

import './controllers/bot-message.controller';

const createApp = () => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Security
  app.use(...securityMiddleware);
  app.use(corsMiddleware);

  // Logging
  if (loggerMiddleware) {
    app.use(loggerMiddleware);
  }

  // Static files
  app.use(express.static(config.PUBLIC_DIR));

  // Routes

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
