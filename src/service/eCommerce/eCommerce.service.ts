import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { RefreshTokenRequest } from '../../api/rest/v1/controllers/Auth/Auth.type';
import { AddToCartRequest } from '../../api/rest/v1/controllers/eCommerce/eCommerce.type';
import { eCommerceCRUDService } from './eCommerce.CRUD.service';
import User from '../../db/entities/userRelated/User';
import Item from '../../db/entities/itemRelated/Item';
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
}