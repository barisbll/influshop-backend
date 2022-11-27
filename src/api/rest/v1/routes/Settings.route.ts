import express from 'express';
import Container from 'typedi';
import { isAuth } from '../../../../middleware/is-auth';
import { SettingsController } from '../controllers/Settings/Settings.controller';

export const createRouter = () => {
  const settingsController = Container.get(SettingsController);

  const router = express.Router();

  router.get('/address', isAuth, settingsController.addressRead);

  router.post('/address', isAuth, settingsController.addressCreate);

  router.put('/address', isAuth, settingsController.addressUpdate);

  router.delete('/address/:addressId', isAuth, settingsController.addressDelete);

  router.get('/credit-card', isAuth, settingsController.creditCardRead);

  router.post('/credit-card', isAuth, settingsController.creditCardCreate);

  router.delete('/credit-card/:creditCardId', isAuth, settingsController.creditCardDelete);

  // router.post('/real-name', isAuth, settingsController.realNameCreate);

  return router;
};
