import { NextFunction, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { Service } from 'typedi';
import { ExtendedRequest } from '../../../../../middleware/is-auth';
import { ReportService } from '../../../../../service/Report/Report.service';
import { RefreshTokenRequest } from '../Auth/Auth.type';
import { itemReportCreateValidator } from './validators/ItemReport.create.validator';
import {
  ItemReportCreateRequest,
  ItemReportReadRequest,
  ItemReportAdminReadRequest,
  ItemReportInspectRequest,
} from './Report.type';
import { itemReportReadValidator } from './validators/ItemReport.read.validator';
import { itemReportsReadValidator } from './validators/ItemReports.read.validator';
import { itemReportAdminReadValidator } from './validators/ItemReportAdmin.read.validator';
import { itemReportInspectValidator } from './validators/ItemReport.inspect.validator';

@Service()
export class ReportController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly reportService: ReportService) {}

  itemReportRead = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const itemReportReadRequest = req.body as ItemReportReadRequest;

    try {
      const validatedBody = await itemReportReadValidator(itemReportReadRequest);

      const itemReport = await this.reportService.itemReportRead(validatedBody, decodedToken);
      res
        .json({ message: itemReport ? 'Item Report Fetched' : 'Item Report Not Found', itemReport })
        .status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemReportsRead = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const { pageId } = req.params;

    try {
      const validatedBody = await itemReportsReadValidator({ pageId });
      const itemReports = await this.reportService.itemReportsRead(validatedBody, decodedToken);
      res
        .json({
          message: itemReports.length !== 0 ? 'Item Reports Fetched' : 'Item Reports Not Found',
          itemReports,
        })
        .status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemReportAdminRead = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const { itemId, pageId } = req.params;
    let { isControlled, isApproved } = req.query as Partial<ItemReportAdminReadRequest>;

    // isControlled = isControlled ?? false;
    isApproved = isApproved ?? null;

    if (isApproved === 'true') {
      isApproved = true;
    }
    if (isApproved === 'false') {
      isApproved = false;
    }

    const validationParams: any = {
      itemId,
      pageId,
    };

    if (isControlled) {
      validationParams.isControlled = isControlled;
    }

    try {
      const validatedBody = (await itemReportAdminReadValidator(
        validationParams,
      )) as ItemReportAdminReadRequest;
      const itemReports = await this.reportService.itemReportAdminRead(
        { ...validatedBody, isApproved },
        decodedToken,
      );
      res
        .json({
          message: 'Item fetched',
          itemReports,
        })
        .status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemReportCreate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const itemReportCreateRequest = req.body as ItemReportCreateRequest;

    try {
      const validatedBody = await itemReportCreateValidator(itemReportCreateRequest);
      const reportId = await this.reportService.itemReportCreate(validatedBody, decodedToken);
      res
        .json({ message: 'Item Report Successfully Completed', itemReport: reportId })
        .status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemReportInspect = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const itemReportInspectRequest = req.body as ItemReportInspectRequest;

    try {
      const validatedBody = await itemReportInspectValidator(itemReportInspectRequest);
      const itemId = await this.reportService.itemReportInspect(validatedBody, decodedToken);
      res.json({ message: 'Item Report Successfully Completed', itemId }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };
}
