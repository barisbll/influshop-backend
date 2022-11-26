import clone from 'clone';
import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { CustomError } from '../../util/CustomError';
import Item from '../../db/entities/itemRelated/Item';
import User from '../../db/entities/userRelated/User';
import { AddToCartRequest } from '../../api/rest/v1/controllers/eCommerce/eCommerce.type';
import CartItem from '../../db/entities/userRelated/CartItem';

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
}
