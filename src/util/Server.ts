import compression from 'compression';
import cors from 'cors';
import express, { Express } from 'express';
import 'reflect-metadata';
import { createRouter as routes } from '../api/rest/v1/routes/routes';
import logger from '../config/logger';
import morganMiddleware from '../config/morgan';

export class Server {
  private static app: Express;

  public static getServer(): Express {
    if (!Server.app) {
      const app = express();
      Server.app = app;
      try {
        Server.app.use(express.json());
        Server.app.use(cors());
        Server.app.use(compression());
        Server.app.use(morganMiddleware);
        Server.app.use('/api/v1', routes());

        return Server.app;
      } catch (error) {
        logger.error(error);
        throw error;
      }
    }

    return Server.app;
  }
}
