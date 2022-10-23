import { NextFunction, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { Service } from 'typedi';
import { ExtendedRequest } from '../../../../../middleware/is-auth';
import { ItemOpsService } from '../../../../../service/ItemOps.service';
import { CustomError } from '../../../../../util/CustomError';
import { RefreshTokenRequest } from '../Auth/Auth.type';
import {
    ItemCreateRequest,
    ItemGroupCreateRequest,
    ItemWithExtraCreateRequest,
} from './ItemOps.type';
import { itemCreateValidator } from './validators/ItemCreate.validator';
import { itemGetValidator } from './validators/ItemGet.validator';
import { itemGetWithExtraFeaturesValidator } from './validators/ItemGetWithExtraFeatures.validator';
import { itemGroupCreateValidator } from './validators/ItemGroupCreate.validator';
import { itemGroupGetValidator } from './validators/ItemGroupGet.validator';
import { itemsGetValidator } from './validators/ItemsGet.validator';
import { itemWithExtraCreateValidator } from './validators/ItemWithExtraCreate.validator';

@Service()
export class ItemOpsController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly itemOps: ItemOpsService) {}

  itemGroupsGet = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const itemGroups = await this.itemOps.itemGroupsGet(decodedToken);
      res.json({ message: 'Item Group Successfully Retrieved', itemGroups }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemGroupGet = async (req: Request, res: Response, next: NextFunction) => {
    const itemGroupGetRequest = req.params as { id: string };

    try {
      const validatedBody = await itemGroupGetValidator(itemGroupGetRequest);
      const itemGroup = await this.itemOps.itemGroupGet(validatedBody.id);
      res.json({ message: 'Item Group Successfully Retrieved', itemGroup }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemGroupCreate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    req.body as ItemGroupCreateRequest;
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    try {
      const validatedBody = (await itemGroupCreateValidator(req.body)) as ItemGroupCreateRequest;
      await this.itemOps.itemGroupCreate(validatedBody, decodedToken);
      res.json({ message: 'ItemGroup Successfully Created' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemsGet = async (req: Request, res: Response, next: NextFunction) => {
    const influencerName = req.params as { influencerName: string };

    if (!influencerName) {
      next(
        new CustomError('Influencer Name Is Required As a URL Parameter', HttpStatus.BAD_REQUEST),
      );
    }

    try {
      const validatedBody = (await itemsGetValidator(influencerName)) as { influencerName: string };
      const items = await this.itemOps.itemsGet(validatedBody.influencerName);
      res.json({ message: 'Items Successfully Retrieved', items }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  // TODO: After implementation ask elvin to control item
  // screen by the extraFeatures query parameters
  // for main page to item page
  itemGet = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };

    try {
      const validatedBody = await itemGetValidator({
        id,
      });

      const item = await this.itemOps.itemGet(validatedBody.id);
      res.json({ message: 'Item Successfully Retrieved', item }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemGetWithExtraFeatures = async (req: Request, res: Response, next: NextFunction) => {
    const { influencerName, itemGroupName } = req.params as {
      influencerName: string;
      itemGroupName: string;
    };
    const queryParams = req.query as { isExtra: string };

    if (Object.keys(queryParams).length < 1 || Object.keys(queryParams).length > 6) {
      next(
        new CustomError(
          'Extra Features Query Parameters Length Must Be Between 1 and 5',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    try {
      const validatedBody = await itemGetWithExtraFeaturesValidator({
        influencerName,
        itemGroupName,
      });
      const item = await this.itemOps.itemGetWithExtraFeatures(
        validatedBody.influencerName,
        validatedBody.itemGroupName,
        queryParams,
      );
      res.json({ message: 'Item Successfully Retrieved', item }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemCreateWithExtra = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    req.body as ItemWithExtraCreateRequest;
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const validatedBody = (await itemWithExtraCreateValidator(
        req.body,
      )) as unknown as ItemWithExtraCreateRequest;
      await this.itemOps.itemCreateWithExtra(validatedBody, decodedToken);
      res.json({ message: 'Item Successfully Created' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemCreate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    req.body as ItemCreateRequest;
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const validatedBody = (await itemCreateValidator(req.body)) as unknown as ItemCreateRequest;
      await this.itemOps.itemCreate(validatedBody, decodedToken);
      res.json({ message: 'Item Successfully Created' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };
}
