import express from 'express';
import Container from 'typedi';
import { isAuth, optionalIsAuth } from '../../../../middleware/is-auth';
import { ItemOpsController } from '../controllers/ItemOps/ItemOps.controller';

export const createRouter = () => {
  const itemOpsController = Container.get(ItemOpsController);

  const router = express.Router();

  router.get('/item-group/:itemGroupId', itemOpsController.itemGroupGet);

  router.get('/item-groups', isAuth, itemOpsController.itemGroupsGet);

  router.get('/items/:influencerName', optionalIsAuth, itemOpsController.itemsGet);

  router.get('/main-page-items/:pageId', optionalIsAuth, itemOpsController.mainPageItemsGet);

  router.get('/item/:itemId', optionalIsAuth, itemOpsController.itemGet);

  router.get('/item/:influencerName/:itemGroupName/extra', optionalIsAuth, itemOpsController.itemGetWithExtraFeatures);

  router.post('/item-group', isAuth, itemOpsController.itemGroupCreate);

  router.post('/item/extra', isAuth, itemOpsController.itemCreateWithExtra);

  router.post('/item', isAuth, itemOpsController.itemCreate);

  router.put('/item-group', isAuth, itemOpsController.itemGroupUpdate);

  router.put('/item/extra', isAuth, itemOpsController.itemUpdateWithExtra);

  router.put('/item', isAuth, itemOpsController.itemUpdate);

  router.delete('/item-group/:itemGroupId', isAuth, itemOpsController.itemGroupDelete);

  router.delete('/item/extra/:itemId', isAuth, itemOpsController.itemDeleteWithExtra);

  router.delete('/item/:itemId', isAuth, itemOpsController.itemDelete);

  return router;
};
