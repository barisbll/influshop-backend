import compression from 'compression';
import express from 'express';
import logger from './config/logger';
import morganMiddleware from './config/morgan';
import config from './config/config';
import AppDataSource from './config/data-source';

const app = express();

app.use(compression());
app.use(morganMiddleware);

app.get('/logger', (_, res) => {
  logger.error('This is an error log');
  logger.warn('This is a warn log');
  logger.info('This is a info log');
  logger.debug('This is a debug log');

  res.send('Hello world');
});

AppDataSource.initialize().then(() => {
  app.listen(config.port, () => {
    logger.info(`Server started at http://localhost:${config.port}`);
  });
});
