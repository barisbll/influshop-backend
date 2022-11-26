import express from 'express';
import { createRouter as createAuthRoutes } from './Auth.route';
import { createRouter as createCommentRoutes } from './Comment.route';
import { createRouter as createItemOpsRoutes } from './ItemOps.route';
import { createRouter as createStarRoutes } from './Star.route';
import { createRouter as createReportRoutes } from './Report.route';
import { createRouter as createeCommerceRoutes } from './eCommerce.route';
import { createRouter as createSettingsRoutes } from './Settings.route';

export const createRouter = () => {
  const router = express.Router();

  router.use('/auth', createAuthRoutes());
  router.use('/item-ops', createItemOpsRoutes());
  router.use('/comment', createCommentRoutes());
  router.use('/star', createStarRoutes());
  router.use('/report', createReportRoutes());
  router.use('/e-commerce', createeCommerceRoutes());
  router.use('/settings', createSettingsRoutes());

  return router;
};
