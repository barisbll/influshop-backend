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

  router.get('/user/real-name', isAuth, settingsController.realNameRead);

  router.post('/user/real-name', isAuth, settingsController.realNameCreate);

  router.get('/influencer/real-name', isAuth, settingsController.influencerRealNameRead);

  router.post('/influencer/real-name', isAuth, settingsController.influencerRealNameCreate);

  router.put('/user/username', isAuth, settingsController.userUsernameUpdate);

  router.put('/influencer/username', isAuth, settingsController.influencerUsernameUpdate);

  router.put('/user/email', isAuth, settingsController.userEmailUpdate);

  router.put('/influencer/email', isAuth, settingsController.influencerEmailUpdate);

  router.put('/user/password', isAuth, settingsController.userPasswordUpdate);

  router.put('/influencer/password', isAuth, settingsController.influencerPasswordUpdate);

  router.post('/user/image', isAuth, settingsController.userImageCreate);

  router.post('/influencer/image', isAuth, settingsController.influencerImageCreate);

  return router;
};
