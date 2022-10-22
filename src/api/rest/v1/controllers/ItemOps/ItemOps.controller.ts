import { NextFunction, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { Service } from 'typedi';
import { ExtendedRequest } from '../../../../../middleware/is-auth';
import { ItemOpsService } from '../../../../../service/ItemOps.service';
import { RefreshTokenRequest } from '../Auth/Auth.type';
import {
    ItemCreateRequest, ItemGroupCreateRequest,
    ItemWithExtraCreateRequest,
} from './ItemOps.type';
import { itemCreateValidator } from './validators/ItemCreate.validator';
import { itemGroupCreateValidator } from './validators/ItemGroupCreate.validator';
import { itemWithExtraCreateValidator } from './validators/ItemWithExtraCreate.validator';

@Service()
export class ItemOpsController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly itemOps: ItemOpsService) {}

  itemGroupGet = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const itemGroups = await this.itemOps.itemGroupeGet(decodedToken);
      res.json({ message: 'Item Group Successfully Retrieved', itemGroups }).status(HttpStatus.OK);
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
}
