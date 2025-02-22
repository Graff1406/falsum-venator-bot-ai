import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PUBLIC_DIR: path.join(__dirname, '..', '..', 'public'),
  HOST_NAME: '',
};
