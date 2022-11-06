import { NextFunction, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { Service } from 'typedi';
import { ExtendedRequest } from '../../../../../middleware/is-auth';
import { CommentService } from '../../../../../service/Comment.service';
import { RefreshTokenRequest } from '../Auth/Auth.type';
import { CommentCreateRequest, CommentUpdateRequest } from './Comment.type';
import { commentCreateValidator } from './validators/Comment.create.validator';
import { commentUpdateValidator } from './validators/Comment.update.validator';

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
}
