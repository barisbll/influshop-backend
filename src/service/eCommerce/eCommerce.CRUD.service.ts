import clone from 'clone';
import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { CustomError } from '../../util/CustomError';
import Item from '../../db/entities/itemRelated/Item';
import User from '../../db/entities/userRelated/User';
import HistoricalRecord from '../../db/entities/general/HistoricalRecord';
import {
  AddToCartRequest,
  AddToFavoriteRequest,
  CheckoutRequest,
} from '../../api/rest/v1/controllers/eCommerce/eCommerce.type';
import CartItem from '../../db/entities/userRelated/CartItem';
import FavoriteItem from '../../db/entities/userRelated/FavoriteItem';
import Influencer from '../../db/entities/influencerRelated/Influencer';

@Service()
export class eCommerceCRUDService {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = Container.get('dataSource');
  }

  addToCart = async (
    addToCartRequest: AddToCartRequest,
    oldUser: User,
    oldItem: Item,
  ): Promise<void> => {
    const user = clone(oldUser);
    const item = clone(oldItem);

    if (addToCartRequest.isAddToCart) {
      // Add item to cart or update cart item quantity

      const foundCartItem = user.cartItems?.find((cartItem) => {
        if (cartItem.item?.id === item.id) {
          return true;
        }
        return false;
      });

      if (foundCartItem) {
        // Update cart item quantity

        if (addToCartRequest.quantity === foundCartItem.quantity) {
          throw new CustomError('Item already in cart with same quantity', HttpStatus.BAD_REQUEST);
        }

        foundCartItem.quantity = addToCartRequest.quantity;
        await this.dataSource.getRepository(CartItem).save(foundCartItem);
      } else {
        // Add item to cart

        const cartItem = new CartItem();
        cartItem.quantity = addToCartRequest.quantity;
        cartItem.user = user;
        cartItem.item = item;

        await this.dataSource.getRepository(CartItem).save(cartItem);
      }
    } else {
      // Remove item from cart

      const foundCartItem = user.cartItems?.find((cartItem) => {
        if (cartItem.item?.id === item.id) {
          return true;
        }
        return false;
      });

      if (!foundCartItem) {
        throw new CustomError('Item not in cart', HttpStatus.BAD_REQUEST);
      }

      await this.dataSource
        .getRepository(CartItem)
        .createQueryBuilder()
        .softDelete()
        .from(CartItem)
        .where('id = :id', { id: foundCartItem.id })
        .execute();
    }
  };

  addToFavorite = async (
    addToFavoriteRequest: AddToFavoriteRequest,
    oldUser: User,
    oldItem: Item,
  ): Promise<void> => {
    const user = clone(oldUser);
    const item = clone(oldItem);

    if (addToFavoriteRequest.isAddToFavorite) {
      // Add item to favorites

      const foundFavoriteItem = user.favoriteItems?.find((favoriteItem) => {
        if (favoriteItem.item?.id === item.id) {
          return true;
        }
        return false;
      });

      if (foundFavoriteItem) {
        throw new CustomError('Item already in favorites', HttpStatus.BAD_REQUEST);
      }

      const favoriteItem = new FavoriteItem();
      favoriteItem.user = user;
      favoriteItem.item = item;

      await this.dataSource.getRepository(FavoriteItem).save(favoriteItem);
    } else {
      // Remove item from favorites

      const foundFavoriteItem = user.favoriteItems?.find((favoriteItem) => {
        if (favoriteItem.item?.id === item.id) {
          return true;
        }
        return false;
      });

      if (!foundFavoriteItem) {
        throw new CustomError('Item not in favorites', HttpStatus.BAD_REQUEST);
      }

      await this.dataSource
        .getRepository(FavoriteItem)
        .createQueryBuilder()
        .softDelete()
        .from(FavoriteItem)
        .where('id = :id', { id: foundFavoriteItem.id })
        .execute();
    }
  };

  checkout = async (
    checkoutRequest: CheckoutRequest,
    oldUser: User,
  ): Promise<{ message: string; isSuccessfull: boolean }> => {
    const user = clone(oldUser);

    if (user.cartItems?.length === 0) {
      throw new CustomError('Cart is empty', HttpStatus.BAD_REQUEST);
    }

    const isTransferSuccessfull = Math.random() > 0.75;

    if (!isTransferSuccessfull) {
      // Transfer failed
      user.cartItems?.forEach(async (cartItem) => {
        const historicalRecord = new HistoricalRecord();
        historicalRecord.price =
          (cartItem.item?.itemPrice as number) * (cartItem?.quantity as number);
        historicalRecord.item = cartItem.item;
        historicalRecord.user = user;
        historicalRecord.influencer = cartItem.item?.influencer as Influencer;
        historicalRecord.isPurchaseCompleted = false;
        await this.dataSource.getRepository(HistoricalRecord).save(historicalRecord);
      });

      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        message: 'Transfer failed',
        isSuccessfull: false,
      });
    }

    // Transfer successfull
    user.cartItems?.forEach(async (cartItem) => {
      const historicalRecord = new HistoricalRecord();
      historicalRecord.price =
        (cartItem.item?.itemPrice as number) * (cartItem?.quantity as number);
      historicalRecord.item = cartItem.item;
      historicalRecord.user = user;
      historicalRecord.influencer = cartItem.item?.influencer as Influencer;
      historicalRecord.isPurchaseCompleted = true;
      await this.dataSource.getRepository(HistoricalRecord).save(historicalRecord);

      // eslint-disable-next-line no-param-reassign
      ((cartItem?.item as Item).itemQuantity as number) -= 1;
      await this.dataSource.getRepository(Item).save(cartItem?.item as Item);
    });

    await this.dataSource
      .getRepository(CartItem)
      .createQueryBuilder()
      .softDelete()
      .from(CartItem)
      .where('user_id = :id', { id: user.id })
      .execute();

    return Promise.resolve({
      message: 'Transfer successfull',
      isSuccessfull: true,
    });
  };
}
