/* eslint-disable no-else-return */
import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
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

@Service()
export class SettingsService {
  private dataSource: DataSource;
  private settingsCRUDService: SettingsCRUDService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.settingsCRUDService = Container.get(SettingsCRUDService);
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
}
