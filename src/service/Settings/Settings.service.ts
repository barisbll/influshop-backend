/* eslint-disable no-else-return */
import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { hash } from 'bcryptjs';
import { CustomError } from '../../util/CustomError';
import User from '../../db/entities/userRelated/User';
import {
  AddressCreateRequest,
  AddressUpdateRequest,
  CreditCardCreateRequest,
} from '../../api/rest/v1/controllers/Settings/Settings.type';
import { RefreshTokenRequest } from '../../api/rest/v1/controllers/Auth/Auth.type';
import { SettingsCRUDService } from './Settings.CRUD.service';
import UserAddress from '../../db/entities/userRelated/UserAddress';
import Influencer from '../../db/entities/influencerRelated/Influencer';
import { AuthService } from '../Auth.service';

@Service()
export class SettingsService {
  private dataSource: DataSource;
  private settingsCRUDService: SettingsCRUDService;
  private authService: AuthService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.settingsCRUDService = Container.get(SettingsCRUDService);
    this.authService = Container.get(AuthService);
  }

  addressRead = async (decodedToken: RefreshTokenRequest) => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: decodedToken.id,
      },
      relations: {
        addresses: true,
      },
    });

    if (!user) {
      throw new CustomError('UserNotFound', HttpStatus.NOT_FOUND, {
        message: 'User not found',
      });
    }

    return user.addresses;
  };

  addressCreate = async (
    addressCreateRequest: AddressCreateRequest,
    decodedToken: RefreshTokenRequest,
  ) => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: decodedToken.id,
      },
      relations: {
        addresses: true,
      },
    });

    if (!user) {
      throw new CustomError('UserNotFound', HttpStatus.NOT_FOUND, {
        message: 'User not found',
      });
    }

    await this.settingsCRUDService.addressCreate(addressCreateRequest, user);
  };

  addressUpdate = async (
    addressUpdateRequest: AddressUpdateRequest,
    decodedToken: RefreshTokenRequest,
  ) => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: decodedToken.id,
      },
      relations: {
        addresses: true,
      },
    });

    if (!user) {
      throw new CustomError('UserNotFound', HttpStatus.NOT_FOUND, {
        message: 'User not found',
      });
    }

    const address = await this.dataSource.getRepository(UserAddress).findOne({
      where: {
        id: addressUpdateRequest.id,
      },
      relations: {
        user: true,
      },
    });

    if (!address) {
      throw new CustomError('AddressNotFound', HttpStatus.NOT_FOUND, {
        message: 'Address not found',
      });
    }

    if ((address.user as User).id !== user.id) {
      throw new CustomError('User do not have this address', HttpStatus.NOT_FOUND, {
        message: 'Address not found',
      });
    }

    await this.settingsCRUDService.addressUpdate(addressUpdateRequest, user, address);
  };

  addressDelete = async (
    addressDeleteRequest: { addressId: string },
    decodedToken: RefreshTokenRequest,
  ) => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: decodedToken.id,
      },
      relations: {
        addresses: true,
      },
    });

    if (!user) {
      throw new CustomError('UserNotFound', HttpStatus.NOT_FOUND, {
        message: 'User not found',
      });
    }

    const foundAddress = (user?.addresses || []).find(
      (address) => address.id === addressDeleteRequest.addressId,
    );

    if (!foundAddress) {
      throw new CustomError("User doesn't have such an address", HttpStatus.NOT_FOUND, {
        message: 'Address not found',
      });
    }

    await this.settingsCRUDService.addressDelete(foundAddress, user);
  };

  creditCardRead = async (decodedToken: RefreshTokenRequest) => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: decodedToken.id,
      },
      relations: {
        creditCards: true,
      },
    });

    if (!user) {
      throw new CustomError('UserNotFound', HttpStatus.NOT_FOUND, {
        message: 'User not found',
      });
    }

    const filteredResult = (user?.creditCards || []).map((creditCard) => ({
      id: creditCard.id,
      creditCardName: creditCard.creditCardName,
      cardHolderNameAnonymized: creditCard.cardHolderNameAnonymized,
      last4Digits: creditCard.last4Digits,
    }));

    return filteredResult;
  };

  creditCardCreate = async (
    creditCardCreateRequest: CreditCardCreateRequest,
    decodedToken: RefreshTokenRequest,
  ) => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: decodedToken.id,
      },
      relations: {
        creditCards: true,
      },
    });

    if (!user) {
      throw new CustomError('UserNotFound', HttpStatus.NOT_FOUND, {
        message: 'User not found',
      });
    }

    await this.settingsCRUDService.creditCardCreate(creditCardCreateRequest, user);
  };

  creditCardDelete = async (
    creditCardDeleteRequest: { creditCardId: string },
    decodedToken: RefreshTokenRequest,
  ) => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: decodedToken.id,
      },
      relations: {
        creditCards: true,
      },
    });

    if (!user) {
      throw new CustomError('UserNotFound', HttpStatus.NOT_FOUND, {
        message: 'User not found',
      });
    }

    const foundCreditCard = (user?.creditCards || []).find(
      (creditCard) => creditCard.id === creditCardDeleteRequest.creditCardId,
    );

    if (!foundCreditCard) {
      throw new CustomError("User doesn't have such a credit card", HttpStatus.NOT_FOUND, {
        message: 'Credit card not found',
      });
    }

    await this.settingsCRUDService.creditCardDelete(foundCreditCard, user);
  };

  realNameRead = async (decodedToken: RefreshTokenRequest) => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: decodedToken.id,
      },
    });

    if (!user) {
      throw new CustomError('UserNotFound', HttpStatus.NOT_FOUND, {
        message: 'User not found',
      });
    }

    return user.realName;
  };

  realNameCreate = async (
    realNameCreateRequest: { realName: string },
    decodedToken: RefreshTokenRequest,
  ) => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: decodedToken.id,
      },
    });

    if (!user) {
      throw new CustomError('UserNotFound', HttpStatus.NOT_FOUND, {
        message: 'User not found',
      });
    }

    await this.settingsCRUDService.realNameCreate(realNameCreateRequest.realName, user);
  };

  influencerRealNameRead = async (decodedToken: RefreshTokenRequest) => {
    const influencer = await this.dataSource.getRepository(Influencer).findOne({
      where: {
        id: decodedToken.id,
      },
    });

    if (!influencer) {
      throw new CustomError('influencerNotFound', HttpStatus.NOT_FOUND, {
        message: 'Influencer not found',
      });
    }

    return influencer.realName;
  };

  influencerRealNameCreate = async (
    realNameCreateRequest: { realName: string },
    decodedToken: RefreshTokenRequest,
  ) => {
    const influencer = await this.dataSource.getRepository(Influencer).findOne({
      where: {
        id: decodedToken.id,
      },
    });

    if (!influencer) {
      throw new CustomError('Influencer Not Found', HttpStatus.NOT_FOUND);
    }

    await this.settingsCRUDService.influencerRealNameCreate(
      realNameCreateRequest.realName,
      influencer,
    );
  };

  userUsernameUpdate = async (
    usernameUpdateRequest: { username: string },
    decodedToken: RefreshTokenRequest,
  ) => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: decodedToken.id,
      },
    });

    if (!user) {
      throw new CustomError('User Not Found', HttpStatus.NOT_FOUND);
    }

    const isUsernameUnique = await this.authService.isUsernameUnique(
      usernameUpdateRequest.username,
    );

    if (!isUsernameUnique) {
      throw new CustomError('Username is already taken', HttpStatus.BAD_REQUEST);
    }

    user.username = usernameUpdateRequest.username;
    await this.dataSource.getRepository(User).save(user);
  };

  influencerUsernameUpdate = async (
    usernameUpdateRequest: { username: string },
    decodedToken: RefreshTokenRequest,
  ) => {
    const influencer = await this.dataSource.getRepository(Influencer).findOne({
      where: {
        id: decodedToken.id,
      },
    });

    if (!influencer) {
      throw new CustomError('InfluencerNotFound', HttpStatus.NOT_FOUND, {
        message: 'influencer not found',
      });
    }

    const isUsernameUnique = await this.authService.isUsernameUnique(
      usernameUpdateRequest.username,
    );

    if (!isUsernameUnique) {
      throw new CustomError('Username is already taken', HttpStatus.BAD_REQUEST);
    }

    influencer.username = usernameUpdateRequest.username;
    await this.dataSource.getRepository(Influencer).save(influencer);
  };

  userEmailUpdate = async (
    emailUpdateRequest: { email: string },
    decodedToken: RefreshTokenRequest,
  ) => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: decodedToken.id,
      },
    });

    if (!user) {
      throw new CustomError('User Not Found', HttpStatus.NOT_FOUND);
    }

    const isEmailUnique = await this.authService.isEmailUnique(
      emailUpdateRequest.email,
    );

    if (!isEmailUnique) {
      throw new CustomError('Email is already taken', HttpStatus.BAD_REQUEST);
    }

    user.email = emailUpdateRequest.email;
    await this.dataSource.getRepository(User).save(user);
  };

  influencerEmailUpdate = async (
    emailUpdateRequest: { email: string },
    decodedToken: RefreshTokenRequest,
  ) => {
    const influencer = await this.dataSource.getRepository(Influencer).findOne({
      where: {
        id: decodedToken.id,
      },
    });

    if (!influencer) {
      throw new CustomError('Influencer Not Found', HttpStatus.NOT_FOUND);
    }

    const isEmailUnique = await this.authService.isEmailUnique(
      emailUpdateRequest.email,
    );

    if (!isEmailUnique) {
      throw new CustomError('Email is already taken', HttpStatus.BAD_REQUEST);
    }

    influencer.email = emailUpdateRequest.email;
    await this.dataSource.getRepository(Influencer).save(influencer);
  };

  userPasswordUpdate = async (
    passwordUpdateRequest: { password: string },
    decodedToken: RefreshTokenRequest,
  ) => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: decodedToken.id,
      },
    });

    if (!user) {
      throw new CustomError('User Not Found', HttpStatus.NOT_FOUND);
    }

    user.password = await hash(passwordUpdateRequest.password, 12);

    await this.dataSource.getRepository(User).save(user);
  };

  influencerPasswordUpdate = async (
    passwordUpdateRequest: { password: string },
    decodedToken: RefreshTokenRequest,
  ) => {
    const influencer = await this.dataSource.getRepository(Influencer).findOne({
      where: {
        id: decodedToken.id,
      },
    });

    if (!influencer) {
      throw new CustomError('User Not Found', HttpStatus.NOT_FOUND);
    }

    influencer.password = await hash(passwordUpdateRequest.password, 12);

    await this.dataSource.getRepository(Influencer).save(influencer);
  };

  userImageCreate = async (
    imageCreateRequest: { image: string },
    decodedToken: RefreshTokenRequest,
  ) => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: {
        id: decodedToken.id,
      },
    });

    if (!user) {
      throw new CustomError('User Not Found', HttpStatus.NOT_FOUND);
    }

    await this.settingsCRUDService.userImageCreate(imageCreateRequest.image, user);
  };

  influencerImageCreate = async (
    imageCreateRequest: { image: string },
    decodedToken: RefreshTokenRequest,
  ) => {
    const influencer = await this.dataSource.getRepository(Influencer).findOne({
      where: {
        id: decodedToken.id,
      },
    });

    if (!influencer) {
      throw new CustomError('Influencer Not Found', HttpStatus.NOT_FOUND);
    }

    await this.settingsCRUDService.influencerImageCreate(imageCreateRequest.image, influencer);
  };
}
