import { NextFunction, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { Service } from 'typedi';
import { ExtendedRequest } from '../../../../../middleware/is-auth';
import { CommentService } from '../../../../../service/Comment.service';
import { RefreshTokenRequest } from '../Auth/Auth.type';
import { CommentCreateRequest, CommentUpdateRequest, CommentLikeOperationRequest, CommentDislikeOperationRequest } from './Comment.type';
import { commentCreateValidator } from './validators/Comment.create.validator';
import { commentDeleteValidator } from './validators/Comment.delete.validator';
import { commentUpdateValidator } from './validators/Comment.update.validator';
import { commentLikeValidator } from './validators/Comment.like.validator';
import { commentDislikeValidator } from './validators/Comment.dislike.validator';

@Service()
export class CommentController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly commentService: CommentService) {}

  commentCreate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const commentCreateRequest = req.body as CommentCreateRequest;

    try {
      const validatedBody = await commentCreateValidator(commentCreateRequest);
      const comment = await this.commentService.commentCreate(
        validatedBody,
        decodedToken,
      );
      res.json({ message: 'Comment Successfully Created', comment }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  commentUpdate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const commentUpdateRequest = req.body as CommentUpdateRequest;

    try {
      const validatedBody = await commentUpdateValidator(commentUpdateRequest);
      await this.commentService.commentUpdate(
        validatedBody,
        decodedToken,
      );
      res.json({ message: 'Comment Successfully Updated' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  commentDelete = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const { commentId } = req.params as { commentId: string };

    try {
      const validatedBody = await commentDeleteValidator({ commentId });
      await this.commentService.commentDelete(
        validatedBody.commentId,
        decodedToken,
      );
      res.json({ message: 'Comment Successfully Deleted' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  commentLike = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const commentLikeRequest = req.body as CommentLikeOperationRequest;

    try {
      const validatedBody = await commentLikeValidator(commentLikeRequest);
      await this.commentService.commentLike(
        validatedBody,
        decodedToken,
      );
      const message = validatedBody.isLike ? 'Comment Successfully Liked' : 'Comment Successfully Unliked';
      res.json({ message }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  commentDislike = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const commentDislikeRequest = req.body as CommentDislikeOperationRequest;

    try {
      const validatedBody = await commentDislikeValidator(commentDislikeRequest);
      await this.commentService.commentDislike(
        validatedBody,
        decodedToken,
      );
      const message = validatedBody.isDislike ? 'Comment Successfully Disliked' : 'Comment Successfully Undisliked';
      res.json({ message }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };
}
