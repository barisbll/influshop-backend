import { NextFunction, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { Service } from 'typedi';
import { ExtendedRequest } from '../../../../../middleware/is-auth';
import { RefreshTokenRequest } from '../Auth/Auth.type';
import { eCommerceService } from '../../../../../service/eCommerce/eCommerce.service';
import {
  AddToCartRequest,
  AddToFavoriteRequest,
  CheckoutRequest,
  CheckoutWithSavedRequest,
} from './eCommerce.type';
import { addToCartValidator } from './validators/AddToCart.validator';
import { addToFavoriteValidator } from './validators/AddToFavorite.validator';
import { checkoutValidator } from './validators/Checkout.validator';
import { checkoutWithSavedValidator } from './validators/CheckoutWithSaved.validator';

@Service()
export class eCommerceController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly service: eCommerceService) {}

  getCartItems = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const cartItems = await this.service.getItems(decodedToken);
      const totalPrice = cartItems.reduce(
        (acc, item) => acc + (item?.itemPrice as number) * (item?.itemQuantity as number),
        0,
      );
      res.status(HttpStatus.OK).json({ cartItems, totalPrice });
    } catch (error) {
      next(error);
    }
  };

  addToCart = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const addToCartRequest = req.body as AddToCartRequest;

    try {
      const validatedBody = (await addToCartValidator(
        addToCartRequest,
      )) as unknown as AddToCartRequest;
      await this.service.addToCart(validatedBody, decodedToken);
      res.json({ message: 'Item Successfully Added to the Cart' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  getFavoriteItems = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const favoriteItems = await this.service.getFavoriteItems(decodedToken);
      res.status(HttpStatus.OK).json(favoriteItems);
    } catch (error) {
      next(error);
    }
  };

  addToFavorite = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const addToFavoriteRequest = req.body as AddToFavoriteRequest;

    try {
      const validatedBody = (await addToFavoriteValidator(
        addToFavoriteRequest,
      )) as unknown as AddToFavoriteRequest;
      await this.service.addToFavorite(validatedBody, decodedToken);
      res.json({ message: 'Item Successfully Added to the Favorite' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  checkout = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const checkoutRequest = req.body as CheckoutRequest;

    try {
      const validatedBody = (await checkoutValidator(
        checkoutRequest,
      )) as unknown as CheckoutRequest;
      const { isSuccessfull, message } = await this.service.checkout(validatedBody, decodedToken);
      res.json({ message, isSuccessfull }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  checkoutWithSaved = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const checkoutWithSavedRequest = req.body as CheckoutWithSavedRequest;

    try {
      const validatedBody = (await checkoutWithSavedValidator(
        checkoutWithSavedRequest,
      )) as unknown as CheckoutWithSavedRequest;
      const { isSuccessfull, message } = await this.service.checkoutWithSaved(
        validatedBody,
        decodedToken,
      );
      res.json({ message, isSuccessfull }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };
}
