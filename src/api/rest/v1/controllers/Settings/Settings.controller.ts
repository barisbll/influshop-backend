import { NextFunction, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { Service } from 'typedi';
import { ExtendedRequest } from '../../../../../middleware/is-auth';
import { RefreshTokenRequest } from '../Auth/Auth.type';
import { SettingsService } from '../../../../../service/Settings/Settings.service';
import {
  AddressCreateRequest,
  AddressUpdateRequest,
  CreditCardCreateRequest,
} from './Settings.type';
import { addressCreateValidator } from './validators/Address.create.validator';
import { addressUpdateValidator } from './validators/Address.update.validator';
import { addressDeleteValidator } from './validators/Address.delete.validator';
import { creditCardCreateValidator } from './validators/CreditCard.create.validator';
import { creditCardDeleteValidator } from './validators/CreditCard.delete.validator';

@Service()
export class SettingsController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly settingsService: SettingsService) {}

  addressRead = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const addresses = await this.settingsService.addressRead(decodedToken);

      res.status(HttpStatus.OK).json({
        addresses,
      });
    } catch (error) {
      next(error);
    }
  };

  addressCreate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const addressCreateRequest = req.body as AddressCreateRequest;

    try {
      const validatedBody = (await addressCreateValidator(
        addressCreateRequest,
      )) as unknown as AddressCreateRequest;
      await this.settingsService.addressCreate(validatedBody, decodedToken);
      res.json({ message: 'Address Successfully Added' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  addressUpdate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const addressUpdateRequest = req.body as AddressUpdateRequest;

    try {
      const validatedBody = (await addressUpdateValidator(
        addressUpdateRequest,
      )) as unknown as AddressUpdateRequest;
      await this.settingsService.addressUpdate(validatedBody, decodedToken);
      res.json({ message: 'Address Successfully Updated' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  addressDelete = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const addressDeleteRequest = req.params as { addressId: string };

    try {
      const validatedBody = (await addressDeleteValidator(addressDeleteRequest)) as unknown as {
        addressId: string;
      };
      await this.settingsService.addressDelete(validatedBody, decodedToken);
      res.json({ message: 'Address Successfully Deleted' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  creditCardRead = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const creditCards = await this.settingsService.creditCardRead(decodedToken);

      res.status(HttpStatus.OK).json({
        message: 'Credit Cards Successfully Retrieved',
        creditCards,
      });
    } catch (error) {
      next(error);
    }
  };

  creditCardCreate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const creditCardCreateRequest = req.body as CreditCardCreateRequest;

    try {
      const validatedBody = (await creditCardCreateValidator(
        creditCardCreateRequest,
      )) as unknown as CreditCardCreateRequest;
      await this.settingsService.creditCardCreate(validatedBody, decodedToken);
      res.json({ message: 'Credit Card Successfully Added' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  creditCardDelete = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const creditCardDeleteRequest = req.params as { creditCardId: string };

    try {
      const validatedBody = (await creditCardDeleteValidator(
        creditCardDeleteRequest,
      )) as unknown as {
        creditCardId: string;
      };
      await this.settingsService.creditCardDelete(validatedBody, decodedToken);
      res.json({ message: 'Credit Card Successfully Deleted' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };
}
