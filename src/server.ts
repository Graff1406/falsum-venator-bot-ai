import createApp from './app';
import { config } from './config/app.config';
import { pingServer } from './utils/ping-server.util';
import * as tsConfigPaths from 'tsconfig-paths';

// Configure paths for using aliases
const tsConfigPath = './tsconfig.json';
const baseUrl = './dist'; // Path to the directory where the compiled files are located
tsConfigPaths.register({
  baseUrl,
  paths: require(tsConfigPath).compilerOptions.paths,
});
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
