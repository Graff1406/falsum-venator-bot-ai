import dotenv from 'dotenv';
import path from 'path';
import os from 'os';

dotenv.config();
// console.log(os.hostname());
export const config = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PUBLIC_DIR: path.join(__dirname, '..', '..', 'public'),
  HOST_NAME: '',
};
