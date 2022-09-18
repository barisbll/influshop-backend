import morgan from 'morgan';
import logger from './logger';

const morganMiddleware = morgan(
  (tokens: any, req, res) =>
    JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res)),
      content_length: tokens.res(req, res, 'content-length'),
      response_time: Number.parseFloat(tokens['response-time'](req, res)),
    }),
  {
    stream: {
      write: (message) => {
        const data = JSON.parse(message);
        logger.http('', data);
      },
    },
  },
);

export default morganMiddleware;
