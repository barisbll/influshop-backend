import express from 'express';
import Container from 'typedi';
import { isAuth } from '../../../../middleware/is-auth';
import { ItemOpsController } from '../controllers/ItemOps/ItemOps.controller';

export const createRouter = () => {
  const itemOpsController = Container.get(ItemOpsController);

  const router = express.Router();

  router.get('/item-group', isAuth, itemOpsController.itemGroupGet);

  router.post('/item-group', isAuth, itemOpsController.itemGroupCreate);

  router.post('/item/extra', isAuth, itemOpsController.itemCreateWithExtra);

  router.post('/item', isAuth, itemOpsController.itemCreate);

  return router;
};
