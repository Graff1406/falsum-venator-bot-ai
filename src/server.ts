import createApp from './app';
import { config } from './config/app.config';
import { pingServer } from './utils/ping-server.utils';

const startServer = () => {
  const app = createApp();

  app.listen(config.PORT, () => {
    console.log(`Server is running on http://localhost:${config.PORT}`);
    console.log(`Environment: ${config.NODE_ENV}`);

    if (config.NODE_ENV === 'production' && config.HOST_NAME) {
      pingServer(config.HOST_NAME);
    }
  });
};

startServer();
