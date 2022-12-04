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
  ItemGroupUpdateRequest, ItemWithExtraCreateRequest,
  ItemWithExtraUpdateRequest,
} from './ItemOps.type';
import { itemCreateValidator } from './validators/ItemCreate.validator';
import { itemDeleteWithExtraValidator } from './validators/ItemDeleteWithExtra.validator';
import { itemGetValidator } from './validators/ItemGet.validator';
import { itemGetWithExtraFeaturesValidator } from './validators/ItemGetWithExtraFeatures.validator';
import { itemGroupCreateValidator } from './validators/ItemGroupCreate.validator';
import { itemGroupDeleteValidator } from './validators/ItemGroupDelete.validator';
import { itemGroupGetValidator } from './validators/ItemGroupGet.validator';
import { itemGroupUpdateValidator } from './validators/ItemGroupUpdate.validator';
import { itemsGetValidator } from './validators/ItemsGet.validator';
import { itemUpdateValidator } from './validators/ItemUpdate.validator';
import { itemWithExtraCreateValidator } from './validators/ItemWithExtraCreate.validator';
import { itemWithExtraUpdateValidator } from './validators/ItemWithExtraUpdate.validator';
import { mainPageGetGetValidator } from './validators/MainPageGet.validator';

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
    const itemGroupGetRequest = req.params as { itemGroupId: string };

    try {
      const validatedBody = await itemGroupGetValidator(itemGroupGetRequest);
      const itemGroup = await this.itemOps.itemGroupGet(validatedBody.itemGroupId);
      res.json({ message: 'Item Group Successfully Retrieved', itemGroup }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemsGet = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const influencerName = req.params as { influencerName: string };
    const decodedToken = req.decodedToken as RefreshTokenRequest | undefined;

    if (!influencerName) {
      next(
        new CustomError('Influencer Name Is Required As a URL Parameter', HttpStatus.BAD_REQUEST),
      );
    }

    try {
      const validatedBody = (await itemsGetValidator(influencerName)) as { influencerName: string };
      const items = await this.itemOps.itemsGet(validatedBody.influencerName, decodedToken);
      res.json({ message: 'Items Successfully Retrieved', items }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  mainPageItemsGet = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest | undefined;
    const pageId = req.params as { pageId: string };

    try {
      const validatedBody = (await mainPageGetGetValidator(pageId)) as { pageId: number };
      const item = await this.itemOps.mainPageItemsGet(decodedToken, validatedBody.pageId);
      res.json({ message: 'Item Successfully Retrieved', item }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemGet = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const { itemId } = req.params as { itemId: string };
    const decodedToken = req.decodedToken as RefreshTokenRequest | undefined;

    try {
      const validatedBody = await itemGetValidator({
        itemId,
      });

      const item = await this.itemOps.itemGet(validatedBody.itemId, decodedToken);
      res.json({ message: 'Item Successfully Retrieved', item }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemGetWithExtraFeatures = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const { influencerName, itemGroupName } = req.params as {
      influencerName: string;
      itemGroupName: string;
    };
    const queryParams = req.query as { isExtra: string };
    const decodedToken = req.decodedToken as RefreshTokenRequest | undefined;

    if (Object.keys(queryParams).length < 1 || Object.keys(queryParams).length > 5) {
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
        decodedToken,
      );
      res.json({ message: 'Item Successfully Retrieved', item }).status(HttpStatus.OK);
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

  itemGroupUpdate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    req.body as ItemGroupUpdateRequest;
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const validatedBody = (await itemGroupUpdateValidator(req.body)) as ItemGroupUpdateRequest;
      await this.itemOps.itemGroupUpdate(validatedBody, decodedToken);
      res.json({ message: 'ItemGroup Successfully Updated' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemUpdateWithExtra = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    req.body as ItemWithExtraUpdateRequest;
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const validatedBody = (await itemWithExtraUpdateValidator(
        req.body,
      )) as unknown as ItemWithExtraUpdateRequest;
      await this.itemOps.itemUpdateWithExtra(validatedBody, decodedToken);
      res.json({ message: 'Item Successfully Updated' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemUpdate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    req.body as Omit<ItemWithExtraUpdateRequest, 'extraFeatures'>;
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const validatedBody = (await itemUpdateValidator(req.body)) as unknown as Omit<
        ItemWithExtraUpdateRequest,
        'extraFeatures'
      >;
      await this.itemOps.itemUpdate(validatedBody, decodedToken);
      res.json({ message: 'Item Successfully Updated' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemGroupDelete = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const { itemGroupId } = req.params as { itemGroupId: string };

    try {
      const validatedBody = await itemGroupDeleteValidator({ itemGroupId });
      await this.itemOps.itemGroupDelete(validatedBody.itemGroupId, decodedToken);
      res.json({ message: 'ItemGroup Successfully Deleted' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemDeleteWithExtra = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const { itemId } = req.params as { itemId: string };

    try {
      const validatedBody = await itemDeleteWithExtraValidator({ itemId });
      await this.itemOps.itemDeleteWithExtra(validatedBody.itemId, decodedToken);
      res.json({ message: 'Item Successfully Deleted' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  itemDelete = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const { itemId } = req.params as { itemId: string };

    try {
      const validatedBody = await itemDeleteWithExtraValidator({ itemId });
      await this.itemOps.itemDelete(validatedBody.itemId, decodedToken);
      res.json({ message: 'Item Successfully Deleted' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };
}
