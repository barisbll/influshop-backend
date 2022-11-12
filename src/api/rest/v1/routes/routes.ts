import express from 'express';
import { createRouter as createAuthRoutes } from './Auth.route';
import { createRouter as createCommentRoutes } from './Comment.route';
import { createRouter as createItemOpsRoutes } from './ItemOps.route';
import { createRouter as createStarRoutes } from './Star.route';

export const createRouter = () => {
  const router = express.Router();

  router.use('/auth', createAuthRoutes());
  router.use('/item-ops', createItemOpsRoutes());
  router.use('/comment', createCommentRoutes());
  router.use('/star', createStarRoutes());

  return router;
};
