import express from 'express';
import Container from 'typedi';
import { isAuth } from '../../../../middleware/is-auth';
import { eCommerceController } from '../controllers/eCommerce/eCommerce.controller';

export const createRouter = () => {
  const eCOmmerceController = Container.get(eCommerceController);

  const router = express.Router();

  router.get('/cart', isAuth, eCOmmerceController.getCartItems);

  router.post('/add-to-cart', isAuth, eCOmmerceController.addToCart);

  return router;
};
