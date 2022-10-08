import compression from 'compression';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import config from './config/config';
import AppDataSource from './config/data-source';
import logger from './config/logger';
import morganMiddleware from './config/morgan';
import CustomError from './util/customError';

const app = express();

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

// express.js error handling middleware
const errorHandler = (
  err: TypeError | CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line
  next: NextFunction
) => {
  let customError = err;

  if (!(err instanceof CustomError)) {
    customError = new CustomError(err.message);
  }

  res.status((customError as CustomError).status).send(customError);
};

main();

app.use(errorHandler);
