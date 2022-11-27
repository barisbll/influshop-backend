import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { RefreshTokenRequest } from '../../api/rest/v1/controllers/Auth/Auth.type';
import {
  AddToCartRequest,
  AddToFavoriteRequest,
  CheckoutRequest,
  CheckoutWithSavedRequest,
} from '../../api/rest/v1/controllers/eCommerce/eCommerce.type';
import { eCommerceCRUDService } from './eCommerce.CRUD.service';
import User from '../../db/entities/userRelated/User';
import Item from '../../db/entities/itemRelated/Item';
import CreditCard from '../../db/entities/userRelated/CreditCard';
import { CustomError } from '../../util/CustomError';

@Service()
export class eCommerceService {
  private dataSource: DataSource;
  private eCommerceCRUDService: eCommerceCRUDService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.eCommerceCRUDService = Container.get(eCommerceCRUDService);
  }

  getItems = async (decodedToken: RefreshTokenRequest): Promise<(Item | undefined)[]> => {
    const user = await this.dataSource.manager.findOne(User, {
      where: { id: decodedToken.id },
      relations: {
        cartItems: {
          item: {
            images: true,
          },
        },
      },
    });

    if (!user) {
      throw new CustomError('User not found', HttpStatus.NOT_FOUND);
    }

    return (
      user.cartItems?.map((cartItem) => ({
        id: cartItem.item?.id,
        itemName: cartItem.item?.itemName,
        quantity: cartItem.quantity,
        image: cartItem.item?.images?.[0].imageLocation,
      })) || []
    );
  };

  addToCart = async (
    addToCartRequest: AddToCartRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<void> => {
    const user = await this.dataSource.manager.findOne(User, {
      where: { id: decodedToken.id },
      relations: {
        cartItems: {
          item: true,
        },
      },
    });

    if (!user) {
      throw new CustomError('User not found', HttpStatus.NOT_FOUND);
    }

    const item = await this.dataSource.manager.findOne(Item, {
      where: { id: addToCartRequest.itemId },
      relations: {
        cartItems: {
          user: true,
        },
      },
    });

    if (!item) {
      throw new CustomError('Item not found', HttpStatus.NOT_FOUND);
    }

    await this.eCommerceCRUDService.addToCart(addToCartRequest, user, item);
  };

  getFavoriteItems = async (decodedToken: RefreshTokenRequest): Promise<(Item | undefined)[]> => {
    const user = await this.dataSource.manager.findOne(User, {
      where: { id: decodedToken.id },
      relations: {
        favoriteItems: {
          item: {
            images: true,
          },
        },
      },
    });

    if (!user) {
      throw new CustomError('User not found', HttpStatus.NOT_FOUND);
    }

    return (
      user.favoriteItems?.map((favoriteItem) => ({
        id: favoriteItem.item?.id,
        itemName: favoriteItem.item?.itemName,
        image: favoriteItem.item?.images?.[0].imageLocation,
      })) || []
    );
  };

  addToFavorite = async (
    addToFavoriteRequest: AddToFavoriteRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<void> => {
    const user = await this.dataSource.manager.findOne(User, {
      where: { id: decodedToken.id },
      relations: {
        favoriteItems: {
          item: true,
        },
      },
    });

    if (!user) {
      throw new CustomError('User not found', HttpStatus.NOT_FOUND);
    }

    const item = await this.dataSource.manager.findOne(Item, {
      where: { id: addToFavoriteRequest.itemId },
      relations: {
        favoriteItems: {
          user: true,
        },
      },
    });

    if (!item) {
      throw new CustomError('Item not found', HttpStatus.NOT_FOUND);
    }

    await this.eCommerceCRUDService.addToFavorite(addToFavoriteRequest, user, item);
  };

  checkout = async (
    checkoutRequest: CheckoutRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<{ message: string; isSuccessfull: boolean }> => {
    const user = await this.dataSource.manager.findOne(User, {
      where: { id: decodedToken.id },
      relations: {
        cartItems: {
          item: {
            influencer: true,
          },
        },
      },
    });

    if (!user) {
      throw new CustomError('User not found', HttpStatus.NOT_FOUND);
    }

    const result = await this.eCommerceCRUDService.checkout(checkoutRequest, user);
    return result;
  };

  checkoutWithSaved = async (
    checkoutWithSavedRequest: CheckoutWithSavedRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<{ message: string; isSuccessfull: boolean }> => {
    const user = await this.dataSource.manager.findOne(User, {
      where: { id: decodedToken.id },
      relations: {
        cartItems: {
          item: {
            influencer: true,
          },
        },
      },
    });

    if (!user) {
      throw new CustomError('User not found', HttpStatus.NOT_FOUND);
    }

    const creditCard = await this.dataSource.manager.findOne(CreditCard, {
      where: { id: checkoutWithSavedRequest.creditCardId },
      relations: {
        user: true,
      },
    });

    if (!creditCard) {
      throw new CustomError('Credit card not found', HttpStatus.NOT_FOUND);
    }

    if ((creditCard.user as User).id !== user.id) {
      throw new CustomError("User doesn't have such a credit card", HttpStatus.NOT_FOUND);
    }

    const result = await this.eCommerceCRUDService.checkout(creditCard, user);
    return result;
  };
}
