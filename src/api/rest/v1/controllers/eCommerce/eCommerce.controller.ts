import { NextFunction, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { Service } from 'typedi';
import { ExtendedRequest } from '../../../../../middleware/is-auth';
import { RefreshTokenRequest } from '../Auth/Auth.type';
import { eCommerceService } from '../../../../../service/eCommerce/eCommerce.service';
import { AddToCartRequest } from './eCommerce.type';
import { addToCartValidator } from './validators/AddToCart.validator';

@Service()
export class eCommerceController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly service: eCommerceService) {}

  getCartItems = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const cartItems = await this.service.getItems(decodedToken);
      res.status(HttpStatus.OK).json(cartItems);
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
      res.json({ message: 'Item Successfully added to the cart' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };
}
