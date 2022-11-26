import clone from 'clone';
import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { CustomError } from '../../util/CustomError';
import Item from '../../db/entities/itemRelated/Item';
import User from '../../db/entities/userRelated/User';
import { AddToCartRequest, AddToFavoriteRequest } from '../../api/rest/v1/controllers/eCommerce/eCommerce.type';
import CartItem from '../../db/entities/userRelated/CartItem';
import FavoriteItem from '../../db/entities/userRelated/FavoriteItem';

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
          throw new CustomError(
            'Item already in cart with same quantity',
            HttpStatus.BAD_REQUEST,
          );
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
        throw new CustomError(
          'Item already in favorites',
          HttpStatus.BAD_REQUEST,
        );
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
        throw new CustomError(
          'Item not in favorites',
          HttpStatus.BAD_REQUEST,
        );
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
}
