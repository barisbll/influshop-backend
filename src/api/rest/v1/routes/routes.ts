import express from 'express';
import { createRouter as createAuthRoutes } from './Auth.route';
import { createRouter as createCommentRoutes } from './Comment.route';
import { createRouter as createItemOpsRoutes } from './ItemOps.route';

export const createRouter = () => {
  const router = express.Router();

  router.use('/auth', createAuthRoutes());
  router.use('/item-ops', createItemOpsRoutes());
  router.use('/comment', createCommentRoutes());

  return router;
};
