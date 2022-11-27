import express from 'express';
import Container from 'typedi';
import { isAuth } from '../../../../middleware/is-auth';
import { eCommerceController } from '../controllers/eCommerce/eCommerce.controller';

export const createRouter = () => {
  const eCOmmerceController = Container.get(eCommerceController);

  const router = express.Router();

  router.get('/cart', isAuth, eCOmmerceController.getCartItems);

  router.post('/add-to-cart', isAuth, eCOmmerceController.addToCart);

  router.get('/favorite', isAuth, eCOmmerceController.getFavoriteItems);

  router.post('/add-to-favorite', isAuth, eCOmmerceController.addToFavorite);

  router.post('/checkout', isAuth, eCOmmerceController.checkout);

  router.post('/checkout-with-saved-credit-card', isAuth, eCOmmerceController.checkoutWithSaved);

  return router;
};
