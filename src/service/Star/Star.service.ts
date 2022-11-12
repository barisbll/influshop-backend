import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { RefreshTokenRequest } from '../../api/rest/v1/controllers/Auth/Auth.type';
import { StarCreateRequest } from '../../api/rest/v1/controllers/Star/Star.type';
import { CustomError } from '../../util/CustomError';
import User from '../../db/entities/userRelated/User';
import Item from '../../db/entities/itemRelated/Item';
import { StarCRUDService } from './Star.CRUD.service';

@Service()
export class StarService {
  private dataSource: DataSource;
  private starCRUDService: StarCRUDService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.starCRUDService = Container.get(StarCRUDService);
  }

  starCreate = async (
    body: StarCreateRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<void> => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: decodedToken.id,
      },
      relations: {
        itemStars: {
          item: true,
        },
      },
    });

    if (!user) {
      throw new CustomError('User not found', HttpStatus.NOT_FOUND);
    }

    const item = await this.dataSource.getRepository(Item).findOne({
      where: {
        id: body.itemId,
      },
      relations: {
        itemStars: true,
      },
    });

    if (!item) {
      throw new CustomError('Item not found', HttpStatus.NOT_FOUND);
    }

    await this.starCRUDService.starCreate(body, user, item);
  };
}
