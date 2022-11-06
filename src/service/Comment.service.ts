import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { RefreshTokenRequest } from '../api/rest/v1/controllers/Auth/Auth.type';
import { CommentCreateRequest } from '../api/rest/v1/controllers/Comment/Comment.type';
import Item from '../db/entities/itemRelated/Item';
import User from '../db/entities/userRelated/User';
import { CustomError } from '../util/CustomError';
import { CommentReturn } from './Comment.type';
import { CommentCRUDService } from './CommentCRUD.service';

@Service()
export class CommentService {
  private dataSource: DataSource;
  private commentCRUDService: CommentCRUDService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.commentCRUDService = Container.get(CommentCRUDService);
  }

  findUser = async (userId: string): Promise<User | null> => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: userId,
      },
      relations: {
        comments: true,
      },
    });
    return user;
  };

  findItem = async (itemId: string): Promise<Item | null> => {
    const item = await this.dataSource.getRepository(Item).findOne({
      where: {
        id: itemId,
      },
      relations: {
        comments: true,
      },
    });

    return item;
  };

  commentCreate = async (
    body: CommentCreateRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<CommentReturn> => {
    const user = await this.findUser(decodedToken.id);
    if (!user) {
      throw new CustomError('User not found', HttpStatus.NOT_FOUND);
    }

    const item = await this.findItem(body.itemId);
    if (!item) {
      throw new CustomError('Item not found', HttpStatus.NOT_FOUND);
    }

    const comment = await this.commentCRUDService.commentCreate(body, user, item);
    return comment;
  };
}
