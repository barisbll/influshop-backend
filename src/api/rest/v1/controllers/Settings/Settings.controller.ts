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
import { realNameCreateValidator } from './validators/RealName.create.validator';
import { usernameUpdateValidator } from './validators/Username.update.validator';
import { passwordUpdateValidator } from './validators/Password.update.validator';
import { emailUpdateValidator } from './validators/Email.update.validator';
import { imageCreateValidator } from './validators/Image.create.validator';

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
      const cartId = await this.settingsService.creditCardCreate(validatedBody, decodedToken);
      res
        .json({ message: 'Credit Card Successfully Added', creditCardId: cartId })
        .status(HttpStatus.OK);
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

  realNameRead = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const realName = await this.settingsService.realNameRead(decodedToken);
      res.json({ message: 'Real Name Successfully Readed', realName }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  realNameCreate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const realNameCreateRequest = req.body as { realName: string };

    try {
      const validatedBody = (await realNameCreateValidator(realNameCreateRequest)) as unknown as {
        realName: string;
      };
      await this.settingsService.realNameCreate(validatedBody, decodedToken);
      res.json({ message: 'Real Name Successfully Added' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  influencerRealNameRead = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const realName = await this.settingsService.influencerRealNameRead(decodedToken);
      res.json({ message: 'Real Name Successfully Readed', realName }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  influencerRealNameCreate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const realNameCreateRequest = req.body as { realName: string };

    try {
      const validatedBody = (await realNameCreateValidator(realNameCreateRequest)) as unknown as {
        realName: string;
      };
      await this.settingsService.influencerRealNameCreate(validatedBody, decodedToken);
      res.json({ message: 'Real Name Successfully Added' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  userUsernameUpdate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const usernameUpdateRequest = req.body as { username: string };

    try {
      const validatedBody = (await usernameUpdateValidator(usernameUpdateRequest)) as unknown as {
        username: string;
      };
      await this.settingsService.userUsernameUpdate(validatedBody, decodedToken);
      res.json({ message: 'Username Successfully Updated' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  influencerUsernameUpdate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const usernameUpdateRequest = req.body as { username: string };

    try {
      const validatedBody = (await usernameUpdateValidator(usernameUpdateRequest)) as unknown as {
        username: string;
      };
      await this.settingsService.influencerUsernameUpdate(validatedBody, decodedToken);
      res.json({ message: 'Username Successfully Updated' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  userEmailUpdate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const emailUpdateRequest = req.body as { email: string };

    try {
      const validatedBody = (await emailUpdateValidator(emailUpdateRequest)) as unknown as {
        email: string;
      };
      await this.settingsService.userEmailUpdate(validatedBody, decodedToken);
      res.json({ message: 'Email Successfully Updated' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  influencerEmailUpdate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const emailUpdateRequest = req.body as { email: string };

    try {
      const validatedBody = (await emailUpdateValidator(emailUpdateRequest)) as unknown as {
        email: string;
      };
      await this.settingsService.influencerEmailUpdate(validatedBody, decodedToken);
      res.json({ message: 'Email Successfully Updated' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  userPasswordUpdate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const passwordUpdateRequest = req.body as { password: string };

    try {
      const validatedBody = (await passwordUpdateValidator(passwordUpdateRequest)) as unknown as {
        password: string;
      };
      await this.settingsService.userPasswordUpdate(validatedBody, decodedToken);
      res.json({ message: 'Password Successfully Updated' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  influencerPasswordUpdate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const passwordUpdateRequest = req.body as { password: string };

    try {
      const validatedBody = (await passwordUpdateValidator(passwordUpdateRequest)) as unknown as {
        password: string;
      };
      await this.settingsService.influencerPasswordUpdate(validatedBody, decodedToken);
      res.json({ message: 'Password Successfully Updated' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  userImageRead = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const imageLocation = await this.settingsService.userImageRead(decodedToken);
      res.json({ message: 'Image Successfully Retrieved', imageLocation }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  userImageCreate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const imageCreateRequest = req.body as { image: string };

    try {
      const validatedBody = (await imageCreateValidator(imageCreateRequest)) as unknown as {
        image: string;
      };
      await this.settingsService.userImageCreate(validatedBody, decodedToken);
      res.json({ message: 'Image Successfully Added' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  influencerImageRead = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      const imageLocation = await this.settingsService.influencerImageRead(decodedToken);
      res.json({ message: 'Image Successfully Retrieved', imageLocation }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  influencerImageCreate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const imageCreateRequest = req.body as { image: string };

    try {
      const validatedBody = (await imageCreateValidator(imageCreateRequest)) as unknown as {
        image: string;
      };
      await this.settingsService.influencerImageCreate(validatedBody, decodedToken);
      res.json({ message: 'Image Successfully Added' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  userDelete = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      await this.settingsService.userDelete(decodedToken);
      res.json({ message: 'User Successfully Deleted' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  influencerDelete = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;

    try {
      await this.settingsService.influencerDelete(decodedToken);
      res.json({ message: 'Influencer Successfully Deleted' }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };
}
