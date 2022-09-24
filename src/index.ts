import compression from 'compression';
import express from 'express';
import cors from 'cors';
import logger from './config/logger';
import morganMiddleware from './config/morgan';
import config from './config/config';
import AppDataSource from './config/data-source';

const app = express();

app.get('/logger', (_, res) => {
  logger.error('This is an error log');
  logger.warn('This is a warn log');
  logger.info('This is a info log');
  logger.debug('This is a debug log');

  res.send('Hello world');
});

const main = () => {
  try {
    app.use(express.json());
    app.use(cors());
    app.use(compression());
    app.use(morganMiddleware);

    AppDataSource.initialize().then(() => {
      app.listen(config.port, () => {
        logger.info(`Server started at http://localhost:${config.port}`);
      });
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

main();
