import express from 'express';
import Container from 'typedi';
import { isAuth } from '../../../../middleware/is-auth';
import { ReportController } from '../controllers/Report/Report.controller';

export const createRouter = () => {
  const reportController = Container.get(ReportController);

  const router = express.Router();

  // Item Reports
  router.post('/item/read', isAuth, reportController.itemReportRead);

  router.get('/items/read/:pageId', isAuth, reportController.itemReportsRead);

  router.get('/item/read/:itemId/:pageId', isAuth, reportController.itemReportAdminRead);

  router.post('/item/create', isAuth, reportController.itemReportCreate);

  router.post('/item/inspect', isAuth, reportController.itemReportInspect);

  // Comment Reports
  router.post('/comment/read', isAuth, reportController.commentReportRead);

  router.get('/comments/read/:pageId', isAuth, reportController.commentReportsRead);

  router.get('/comment/read/:commentId/:pageId', isAuth, reportController.commentReportAdminRead);

  router.post('/comment/create', isAuth, reportController.commentReportCreate);

  router.post('/comment/inspect', isAuth, reportController.commentReportInspect);

  // User Reports
  router.post('/user/read', isAuth, reportController.userReportRead);

  router.get('/users/read/:pageId', isAuth, reportController.userReportsRead);

  router.get('/user/read/:userId/:pageId', isAuth, reportController.userReportAdminRead);

  router.post('/user/create', isAuth, reportController.userReportCreate);

  router.post('/user/inspect', isAuth, reportController.userReportInspect);

  // Influencer Reports
  router.post('/influencer/read', isAuth, reportController.influencerReportRead);

  router.get('/influencers/read/:pageId', isAuth, reportController.influencerReportsRead);

  router.get('/influencer/read/:influencerId/:pageId', isAuth, reportController.influencerReportAdminRead);

  router.post('/influencer/create', isAuth, reportController.influencerReportCreate);

  router.post('/influencer/inspect', isAuth, reportController.influencerReportInspect);

  return router;
};
