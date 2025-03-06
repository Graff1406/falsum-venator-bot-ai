import morgan from 'morgan';
import { config } from '../config/app.config';
import { RequestHandler } from 'express';

export const loggerMiddleware: RequestHandler | null =
  config.NODE_ENV === 'development' ? morgan('dev') : null;
