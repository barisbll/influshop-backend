import express from 'express';
import Container from 'typedi';
import { isAuth } from '../../../../middleware/is-auth';
import { ReportController } from '../controllers/Report/Report.controller';

export const createRouter = () => {
  const reportController = Container.get(ReportController);

  const router = express.Router();

  router.post('/item/read', isAuth, reportController.itemReportRead);

  router.get('/items/read/:pageId', isAuth, reportController.itemReportsRead);

  router.get('/item/read/:itemId/:pageId', isAuth, reportController.itemReportAdminRead);

  router.post('/item/create', isAuth, reportController.itemReportCreate);

  router.post('/item/inspect', isAuth, reportController.itemReportInspect);

  return router;
};
