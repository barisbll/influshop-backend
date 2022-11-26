/* eslint-disable no-else-return */
// import clone from 'clone';
// import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
// import { CustomError } from '../../util/CustomError';
// import Item from '../../db/entities/itemRelated/Item';
// import User from '../../db/entities/userRelated/User';
// import { AddToCartRequest } from '../../api/rest/v1/controllers/eCommerce/eCommerce.type';

@Service()
export class eCommerceCRUDService {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = Container.get('dataSource');
  }

//   addToCart = async (
//     addToCartRequest: AddToCartRequest,
//     user: User,
//     item: Item,
//   ): Promise<void> => {};
}
