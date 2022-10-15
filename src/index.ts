import { Express } from 'express';
import { config } from './config/config';
import { AppDataSource } from './config/data-source';
import logger from './config/logger';
import { errorHandler } from './util/CustomError';
import { Server } from './util/Server';

const app = Server.getServer();

// eslint-disable-next-line no-shadow
const initializeDB = async (app: Express) => {
  try {
    AppDataSource.initialize().then(() => {
      app.listen(config.port || 8080, () => {
        logger.info(`Server started at http://localhost:${config.port}`);
      });
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

initializeDB(app);
app.use(errorHandler);
