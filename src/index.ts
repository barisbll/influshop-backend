import express from 'express';
import logger from './config/logger';
import morganMiddleware from './config/morgan';

const app = express();
const PORT = 3000;

app.use(morganMiddleware);

app.get('/logger', (_, res) => {
  logger.error('This is an error log');
  logger.warn('This is a warn log');
  logger.info('This is a info log');
  logger.debug('This is a debug log');

  res.send('Hello world');
});

app.listen(PORT, () => {
  logger.info(`Server is up and running @ http://localhost:${PORT}`);
});
