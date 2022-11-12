import express from 'express';
import Container from 'typedi';
import { isAuth } from '../../../../middleware/is-auth';
import { CommentController } from '../controllers/Comment/Comment.controller';

export const createRouter = () => {
  const commentController = Container.get(CommentController);

  const router = express.Router();

  router.post('/', isAuth, commentController.commentCreate);

  router.put('/', isAuth, commentController.commentUpdate);

  router.delete('/:commentId', isAuth, commentController.commentDelete);

  router.post('/like', isAuth, commentController.commentLike);

  router.post('/dislike', isAuth, commentController.commentDislike);

  return router;
};
