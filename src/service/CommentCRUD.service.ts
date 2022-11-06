/* eslint-disable no-else-return */
import clone from 'clone';
import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import {
  CommentCreateRequest,
  CommentUpdateRequest,
} from '../api/rest/v1/controllers/Comment/Comment.type';
import Comment from '../db/entities/itemRelated/Comment';
import CommentImage from '../db/entities/itemRelated/CommentImage';
import Item from '../db/entities/itemRelated/Item';
import User from '../db/entities/userRelated/User';
import { CustomError } from '../util/CustomError';
import { CommentReturn } from './Comment.type';
import { ImageUploader } from './Image.service';

@Service()
export class CommentCRUDService {
  private dataSource: DataSource;

  // eslint-disable-next-line no-unused-vars
  constructor(private readonly imageUploader: ImageUploader) {
    this.dataSource = Container.get('dataSource');
  }

  commentCreate = async (
    body: CommentCreateRequest,
    user: User,
    item: Item,
  ): Promise<CommentReturn> => {
    const comment = new Comment();
    comment.user = user;
    comment.item = item;
    comment.comment = body.comment;

    if (body.commentImages) {
      const orders = body.commentImages.map((imageObj) => imageObj.order);
      if (orders.length !== new Set(orders).size) {
        throw new CustomError('Comment Images Order Must Be Unique');
      }

      await this.dataSource.getRepository(Comment).save(comment);

      // eslint-disable-next-line no-restricted-syntax
      for (const image of body.commentImages) {
        // eslint-disable-next-line no-await-in-loop
        const publicId = await this.imageUploader.uploadImage(image.image, 'influshop_comments');
        const commentImage = new CommentImage();
        commentImage.imageLocation = publicId;
        commentImage.imageOrder = image.order;
        commentImage.comment = comment;
        // eslint-disable-next-line no-await-in-loop
        const savedCommentImage = await this.dataSource
          .getRepository(CommentImage)
          .save(commentImage);

        comment.commentImages = [...(comment.commentImages || []), clone(savedCommentImage)];
      }
    }
    const savedComment = await this.dataSource.getRepository(Comment).save(comment);

    const clonedComment = clone(savedComment);

    // eslint-disable-next-line no-param-reassign
    user.comments = [...(user.comments || []), clonedComment];
    await this.dataSource.getRepository(User).save(user);

    // eslint-disable-next-line no-param-reassign
    item.comments = [...(item.comments || []), clonedComment];
    if (item.totalComments !== undefined) {
      // eslint-disable-next-line no-param-reassign
      item.totalComments += 1;
    }
    await this.dataSource.getRepository(Item).save(item);

    let returnImages = null;
    if (clonedComment.commentImages) {
      returnImages = clonedComment.commentImages.map((commentImage) => ({
        image: commentImage.imageLocation as string,
        order: commentImage.imageOrder as number,
      }));
    }

    return {
      content: savedComment.comment as string,
      commentImages: returnImages,
      createdAt: savedComment.createdAt as unknown as string,
      createdBy: savedComment.user?.username as string,
    };
  };

  commentUpdate = async (
    body: CommentUpdateRequest,
    user: User,
    comment: Comment,
  ): Promise<void> => {
    const updatedFeatures: Partial<Comment> = {};

    if (body.comment) {
      updatedFeatures.comment = body.comment;
    }

    if (body.commentImages) {
      const oldCommentImages = comment.commentImages;

      const commentImages: CommentImage[] = [];
      body.commentImages.forEach(async (bodyImage) => {
        if (bodyImage.isNew) {
          const publicId = await this.imageUploader.uploadImage(
            bodyImage.image,
            'influshop_comments',
          );
          const commentImage = new CommentImage();
          commentImage.imageLocation = publicId;
          commentImage.imageOrder = bodyImage.order;
          commentImage.comment = comment;
          const newCommentImage = await this.dataSource
            .getRepository(CommentImage)
            .save(commentImage);
          commentImages.push(newCommentImage);
        } else {
          const commentImage = await this.dataSource.getRepository(CommentImage).findOne({
            where: { imageLocation: bodyImage.image },
          });
          if (!commentImage) {
            throw new CustomError('Image Not Found', HttpStatus.NOT_FOUND);
          }
          if (commentImage.imageOrder === bodyImage.order) {
            commentImages.push(commentImage);
          } else {
            await this.dataSource
              .createQueryBuilder()
              .update(CommentImage)
              .set({
                imageOrder: bodyImage.order,
              })
              .where({ id: commentImage.id })
              .execute();
            commentImage.imageOrder = bodyImage.order;
            commentImages.push(commentImage);
          }
        }

        oldCommentImages?.forEach(async (oldCommentImage) => {
          if (
            !commentImages.find(
              (newCommentImage) => newCommentImage.imageLocation === oldCommentImage.imageLocation,
            )
          ) {
            await this.imageUploader.deleteImage(oldCommentImage.imageLocation as string);
            await this.dataSource.getRepository(CommentImage).delete({ id: oldCommentImage.id });
          }
        });
      });
    }
    await this.dataSource
      .createQueryBuilder()
      .update(Comment)
      .set(updatedFeatures)
      .where({ id: comment.id })
      .execute();
  };
}
