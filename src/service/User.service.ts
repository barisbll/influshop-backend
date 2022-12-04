import { hash } from 'bcryptjs';
import { Container, Inject, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { SignupRequest } from '../api/rest/v1/controllers/Auth/Auth.type';
import User from '../db/entities/userRelated/User';
import Comment from '../db/entities/itemRelated/Comment';
import CommentImage from '../db/entities/itemRelated/CommentImage';
import CommentLike from '../db/entities/itemRelated/CommentLike';
import UserAddress from '../db/entities/userRelated/UserAddress';
import CommentReport from '../db/entities/itemRelated/CommentReport';
import CreditCard from '../db/entities/userRelated/CreditCard';
import CartItem from '../db/entities/userRelated/CartItem';
import FavoriteItem from '../db/entities/userRelated/FavoriteItem';

@Service()
export class UserService {
  @Inject('dataSource')
  private dataSource: DataSource;

  constructor() {
    this.dataSource = Container.get('dataSource');
  }

  createUser = async (req: SignupRequest): Promise<string> => {
    const user = new User();
    user.password = await hash(req.password, 12);
    user.username = req.username;
    user.email = req.email;

    const savedUser = await this.dataSource.manager.save(user);

    return savedUser.username as string;
  };

  deleteUser = async (user: User): Promise<void> => {
    // delete comments
    (user?.comments || []).forEach(async (comment) => {
      comment.commentImages?.forEach(async (commentImage) => {
        await this.dataSource
          .getRepository(CommentImage)
          .createQueryBuilder()
          .softDelete()
          .from(CommentImage)
          .where('id = :id', { id: commentImage.id })
          .execute();
      });

      comment.commentLikes?.forEach(async (commentLike) => {
        await this.dataSource
          .getRepository(CommentLike)
          .createQueryBuilder()
          .softDelete()
          .from(CommentLike)
          .where('id = :id', { id: commentLike.id })
          .execute();
      });

      comment.commentReports?.forEach(async (commentReport) => {
        await this.dataSource
          .getRepository(CommentReport)
          .createQueryBuilder()
          .softDelete()
          .from(CommentReport)
          .where('id = :id', { id: commentReport.id })
          .execute();
      });

      await this.dataSource
        .getRepository(Comment)
        .createQueryBuilder()
        .softDelete()
        .from(Comment)
        .where('id = :id', { id: comment.id })
        .execute();
    });

    // delete comment likes
    (user?.commentLikes || []).forEach(async (commentLike) => {
      await this.dataSource
        .getRepository(CommentLike)
        .createQueryBuilder()
        .softDelete()
        .from(CommentLike)
        .where('id = :id', { id: commentLike.id })
        .execute();
    });

    // delete user addresses
    (user?.addresses || []).forEach(async (userAddress) => {
      await this.dataSource
        .getRepository(UserAddress)
        .createQueryBuilder()
        .softDelete()
        .from(UserAddress)
        .where('id = :id', { id: userAddress.id })
        .execute();
    });

    // delete credit cards
    (user?.creditCards || []).forEach(async (creditCard) => {
      await this.dataSource
        .getRepository(CreditCard)
        .createQueryBuilder()
        .softDelete()
        .from(CreditCard)
        .where('id = :id', { id: creditCard.id })
        .execute();
    });

    // delete cart items
    (user?.cartItems || []).forEach(async (cartItem) => {
      await this.dataSource
        .getRepository(CartItem)
        .createQueryBuilder()
        .softDelete()
        .from(CartItem)
        .where('id = :id', { id: cartItem.id })
        .execute();
    });

    // delete favorite items
    (user?.favoriteItems || []).forEach(async (favoriteItem) => {
      await this.dataSource
        .getRepository(FavoriteItem)
        .createQueryBuilder()
        .softDelete()
        .from(FavoriteItem)
        .where('id = :id', { id: favoriteItem.id })
        .execute();
    });

    // delete user
    await this.dataSource
      .getRepository(User)
      .createQueryBuilder()
      .softDelete()
      .from(User)
      .where('id = :id', { id: user.id })
      .execute();
  };
}
