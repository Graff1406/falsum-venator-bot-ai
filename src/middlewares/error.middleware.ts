import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { config } from '../config/app.config';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).sendFile(path.join(config.PUBLIC_DIR, '404.html'));
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('errorHandler', err.stack);
  res.status(500).send('Something went wrong!');
};
