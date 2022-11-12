import { NextFunction, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { Service } from 'typedi';
import { ExtendedRequest } from '../../../../../middleware/is-auth';
import { ReportService } from '../../../../../service/Report/Report.service';
import { RefreshTokenRequest } from '../Auth/Auth.type';
import { itemReportCreateValidator } from './validators/ItemReport.create.validator';
import { ItemReportCreateRequest, ItemReportReadRequest } from './Report.type';
import { itemReportReadValidator } from './validators/ItemReport.read.validator';

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
      res.json({ message: itemReport ? 'Item Report Fetched' : 'Item Report Not Found', itemReport }).status(HttpStatus.OK);
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
}
