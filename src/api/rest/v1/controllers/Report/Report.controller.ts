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
  CommentReportCreateRequest,
  CommentReportReadRequest,
  CommentReportAdminReadRequest,
  CommentReportInspectRequest,
  UserReportCreateRequest,
  UserReportReadRequest,
  UserReportAdminReadRequest,
  InfluencerReportCreateRequest,

} from './Report.type';
import { itemReportReadValidator } from './validators/ItemReport.read.validator';
import { itemReportsReadValidator } from './validators/ItemReports.read.validator';
import { itemReportAdminReadValidator } from './validators/ItemReportAdmin.read.validator';
import { itemReportInspectValidator } from './validators/ItemReport.inspect.validator';
import { commentReportCreateValidator } from './validators/CommentReport.create.validator';
import { commentReportReadValidator } from './validators/CommentReport.read.validator';
import { commentReportAdminReadValidator } from './validators/CommentReportAdmin.read.validator';
import { commentReportInspectValidator } from './validators/CommentReport.inspect.validator';
import { userReportCreateValidator } from './validators/UserReport.create.validator';
import { userReportReadValidator } from './validators/UserReport.read.validator';
import { userReportAdminReadValidator } from './validators/UserReportAdmin.read.validator';
import { influencerReportCreateValidator } from './validators/InfluencerReport.create.validator';
import logger from '../../../../../config/logger';

@Service()
export class ReportController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly reportService: ReportService) {}

  // Item Reports
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
    let { isApproved } = req.query as Partial<ItemReportAdminReadRequest>;
    const { isControlled } = req.query as Partial<ItemReportAdminReadRequest>;

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

  // Comment Report
  commentReportRead = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const commentReportReadRequest = req.body as CommentReportReadRequest;

    try {
      const validatedBody = await commentReportReadValidator(commentReportReadRequest);

      const commentReport = await this.reportService.commentReportRead(validatedBody, decodedToken);
      res
        .json({
          message: commentReport ? 'Comment Report Fetched' : 'Comment Report Not Found',
          commentReport,
        })
        .status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  commentReportsRead = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const { pageId } = req.params;

    try {
      const validatedBody = await itemReportsReadValidator({ pageId });
      const commentReports = await this.reportService.commentReportsRead(
        validatedBody,
        decodedToken,
      );
      res
        .json({
          message:
            commentReports.length !== 0 ? 'Comment Reports Fetched' : 'Comment Reports Not Found',
          commentReports,
        })
        .status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  commentReportAdminRead = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const { commentId, pageId } = req.params;
    let { isApproved } = req.query as Partial<CommentReportAdminReadRequest>;
    const { isControlled } = req.query as Partial<CommentReportAdminReadRequest>;

    isApproved = isApproved ?? null;

    if (isApproved === 'true') {
      isApproved = true;
    }
    if (isApproved === 'false') {
      isApproved = false;
    }

    const validationParams: any = {
      commentId,
      pageId,
    };

    if (isControlled) {
      validationParams.isControlled = isControlled;
    }

    try {
      const validatedBody = (await commentReportAdminReadValidator(
        validationParams,
      )) as CommentReportAdminReadRequest;
      const commentReports = await this.reportService.commentReportAdminRead(
        { ...validatedBody, isApproved },
        decodedToken,
      );
      res
        .json({
          message: 'Comment fetched',
          commentReports,
        })
        .status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  commentReportCreate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const commentReportCreateRequest = req.body as CommentReportCreateRequest;

    try {
      const validatedBody = await commentReportCreateValidator(commentReportCreateRequest);
      const reportId = await this.reportService.commentReportCreate(validatedBody, decodedToken);
      res
        .json({ message: 'Comment Report Successfully Completed', commentReport: reportId })
        .status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  commentReportInspect = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const commentReportInspectRequest = req.body as CommentReportInspectRequest;

    try {
      const validatedBody = await commentReportInspectValidator(commentReportInspectRequest);
      const commentId = await this.reportService.commentReportInspect(validatedBody, decodedToken);
      res.json({ message: 'Comment Report Successfully Completed', commentId }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  // User Report
  userReportRead = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const userReportReadRequest = req.body as UserReportReadRequest;

    try {
      const validatedBody = await userReportReadValidator(userReportReadRequest);

      const userReport = await this.reportService.userReportRead(validatedBody, decodedToken);
      res
        .json({
          message: userReport ? 'User Report Fetched' : 'User Report Not Found',
          userReport,
        })
        .status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  userReportsRead = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const { pageId } = req.params;

    try {
      const validatedBody = await itemReportsReadValidator({ pageId });
      const userReports = await this.reportService.userReportsRead(
        validatedBody,
        decodedToken,
      );
      res
        .json({
          message:
            userReports.length !== 0 ? 'User Reports Fetched' : 'User Reports Not Found',
          userReports,
        })
        .status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  userReportAdminRead = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const { userId, pageId } = req.params;
    let { isApproved } = req.query as Partial<UserReportAdminReadRequest>;
    const { isControlled } = req.query as Partial<UserReportAdminReadRequest>;

    isApproved = isApproved ?? null;

    if (isApproved === 'true') {
      isApproved = true;
    }
    if (isApproved === 'false') {
      isApproved = false;
    }

    const validationParams: any = {
      userId,
      pageId,
    };

    if (isControlled) {
      validationParams.isControlled = isControlled;
    }

    try {
      const validatedBody = (await userReportAdminReadValidator(
        validationParams,
      )) as UserReportAdminReadRequest;
      const userReports = await this.reportService.userReportAdminRead(
        { ...validatedBody, isApproved },
        decodedToken,
      );
      res
        .json({
          message: 'User fetched',
          userReports,
        })
        .status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  userReportCreate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const userReportCreateRequest = req.body as UserReportCreateRequest;

    try {
      const validatedBody = await userReportCreateValidator(userReportCreateRequest);
      const reportId = await this.reportService.userReportCreate(validatedBody, decodedToken);
      res
        .json({ message: 'User Report Successfully Completed', userReport: reportId })
        .status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  // Influencer Report
  influencerReportCreate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const influencerReportCreateRequest = req.body as InfluencerReportCreateRequest;

    try {
      const validatedBody = await influencerReportCreateValidator(influencerReportCreateRequest);
      const reportId = await this.reportService.influencerReportCreate(validatedBody, decodedToken);
      res
        .json({ message: 'Influencer Report Successfully Completed', influencerReport: reportId })
        .status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };
}
