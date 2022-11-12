import express from 'express';
import Container from 'typedi';
import { isAuth } from '../../../../middleware/is-auth';
import { StarController } from '../controllers/Star/Star.controller';

export const createRouter = () => {
  const starController = Container.get(StarController);

  const router = express.Router();

  router.post('/', isAuth, starController.starCreate);

  return router;
};
