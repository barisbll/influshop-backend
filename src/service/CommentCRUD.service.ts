/* eslint-disable no-else-return */
import clone from 'clone';
import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import {
  CommentCreateRequest,
  CommentUpdateRequest,
  CommentLikeOperationRequest,
  CommentDislikeOperationRequest,
} from '../api/rest/v1/controllers/Comment/Comment.type';
import Comment from '../db/entities/itemRelated/Comment';
import CommentImage from '../db/entities/itemRelated/CommentImage';
import Item from '../db/entities/itemRelated/Item';
import User from '../db/entities/userRelated/User';
import { CustomError } from '../util/CustomError';
import { CommentReturn } from './Comment.type';
import { ImageUploader } from './Image.service';
import CommentLike from '../db/entities/itemRelated/CommentLike';

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
      id: clonedComment.id as string,
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

  commentDelete = async (comment: Comment, user: User): Promise<void> => {
    if (comment.commentImages) {
      comment.commentImages.forEach(async (commentImage) => {
        await this.imageUploader.deleteImage(commentImage.imageLocation as string);
          await this.dataSource
            .getRepository(CommentImage)
            .createQueryBuilder()
            .softDelete()
            .from(CommentImage)
            .where('id = :id', { id: commentImage.id })
            .execute();
      });
    }

    comment.commentLikes?.forEach(async (commentLike) => {
      await this.dataSource.getRepository(CommentLike).delete({ id: commentLike.id });
    });
    await this.dataSource.getRepository(User).save(user);

    if (comment.item) {
      // eslint-disable-next-line no-param-reassign
      comment.item.comments = comment.item.comments?.filter(
        (itemComment) => itemComment.id !== comment.id,
      );
      if (comment.item.totalComments !== undefined) {
        // eslint-disable-next-line no-param-reassign
        comment.item.totalComments -= 1;
      }
      await this.dataSource.getRepository(Item).save(comment.item);
    }
    await this.dataSource
    .getRepository(Comment)
    .createQueryBuilder()
    .softDelete()
    .from(Comment)
    .where('id = :id', { id: comment.id })
    .execute();
  };

  didUserLikeDislikeComment = (
    userCommentLikes: CommentLike[] | undefined,
    commentId: string,
    isLikeOrDislike: boolean,
  ): boolean => {
    const foundCommentLike = userCommentLikes?.find(
      (commentLike) =>
        // eslint-disable-next-line max-len
        commentLike.isLike === isLikeOrDislike && (commentLike.comment as Comment)?.id === commentId,
    );

    return !!foundCommentLike;
  };

  commentLike = async (
    body: CommentLikeOperationRequest,
    oldComment: Comment,
    user: User,
  ): Promise<void> => {
    const comment = clone(oldComment);

    if (body.isLike) {
      if (this.didUserLikeDislikeComment(user.commentLikes, body.commentId, true)) {
        throw new CustomError('Already Liked', HttpStatus.BAD_REQUEST);
      }

      if (this.didUserLikeDislikeComment(user.commentLikes, body.commentId, false)) {
        throw new CustomError(
          'A user cannot like and dislike at the same time',
          HttpStatus.BAD_REQUEST,
        );
      }

      const commentLike = new CommentLike();
      commentLike.isLike = true;
      commentLike.comment = comment;
      commentLike.user = user;
      await this.dataSource.getRepository(CommentLike).save(commentLike);
      comment.commentLikes = [...(comment.commentLikes || []), commentLike];
      (comment.likes as number) += 1;
      // eslint-disable-next-line no-param-reassign
      user.commentLikes = [...(user.commentLikes || []), commentLike];
    }

    if (!body.isLike) {
      if (!this.didUserLikeDislikeComment(user.commentLikes, body.commentId, true)) {
        throw new CustomError('Not Previously Liked', HttpStatus.BAD_REQUEST);
      }

      const commentLike = await this.dataSource.getRepository(CommentLike).findOne({
        where: { comment: { id: body.commentId }, user: { id: user.id } },
      });

      if (!commentLike) {
        throw new CustomError('Comment Like Not Found', HttpStatus.NOT_FOUND);
      }
      await this.dataSource.getRepository(CommentLike).delete({ id: commentLike.id });
      comment.commentLikes = comment.commentLikes?.filter(
        (commentLike2) => commentLike2.id !== body.commentId,
      );
      // eslint-disable-next-line no-param-reassign
      user.commentLikes = user.commentLikes?.filter(
        (commentLike2) => commentLike2.id !== body.commentId,
      );

      (comment.likes as number) -= 1;
    }

    await this.dataSource.getRepository(Comment).save(comment);
    await this.dataSource.getRepository(User).save(user);
  };

  commentDislike = async (
    body: CommentDislikeOperationRequest,
    oldComment: Comment,
    user: User,
  ): Promise<void> => {
    const comment = clone(oldComment);

    if (body.isDislike) {
      if (this.didUserLikeDislikeComment(user.commentLikes, body.commentId, false)) {
        throw new CustomError('Already Disliked', HttpStatus.BAD_REQUEST);
      }

      if (this.didUserLikeDislikeComment(user.commentLikes, body.commentId, true)) {
        throw new CustomError(
          'A user cannot like and dislike at the same time',
          HttpStatus.BAD_REQUEST,
        );
      }

      const commentLike = new CommentLike();
      commentLike.isLike = false;
      commentLike.comment = comment;
      commentLike.user = user;
      await this.dataSource.getRepository(CommentLike).save(commentLike);
      comment.commentLikes = [...(comment.commentLikes || []), commentLike];
      (comment.dislikes as number) += 1;
      // eslint-disable-next-line no-param-reassign
      user.commentLikes = [...(user.commentLikes || []), commentLike];
    }

    if (!body.isDislike) {
      if (!this.didUserLikeDislikeComment(user.commentLikes, body.commentId, false)) {
        throw new CustomError('Not Previously Disliked', HttpStatus.BAD_REQUEST);
      }

      const commentLike = await this.dataSource.getRepository(CommentLike).findOne({
        where: { comment: { id: body.commentId }, user: { id: user.id } },
      });

      if (!commentLike) {
        throw new CustomError('Comment Dislike Not Found', HttpStatus.NOT_FOUND);
      }
      await this.dataSource.getRepository(CommentLike).delete({ id: commentLike.id });
      comment.commentLikes = comment.commentLikes?.filter(
        (commentLike2) => commentLike2.id !== body.commentId,
      );
      // eslint-disable-next-line no-param-reassign
      user.commentLikes = user.commentLikes?.filter(
        (commentLike2) => commentLike2.id !== body.commentId,
      );

      (comment.dislikes as number) -= 1;
    }

    await this.dataSource.getRepository(Comment).save(comment);
    await this.dataSource.getRepository(User).save(user);
  };
}
