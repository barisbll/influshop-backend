/* eslint-disable no-else-return */
import clone from 'clone';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { hash } from 'bcryptjs';
import User from '../../db/entities/userRelated/User';
import {
  AddressCreateRequest,
  AddressUpdateRequest,
  CreditCardCreateRequest,
} from '../../api/rest/v1/controllers/Settings/Settings.type';
import UserAddress from '../../db/entities/userRelated/UserAddress';
import CreditCard from '../../db/entities/userRelated/CreditCard';
import { anonymizeNames } from './Settings.helper';
import Influencer from '../../db/entities/influencerRelated/Influencer';
import { ImageUploader } from '../Image.service';

@Service()
export class SettingsCRUDService {
  private dataSource: DataSource;
  private imageUploader = Container.get(ImageUploader);

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.imageUploader = Container.get(ImageUploader);
  }

  addressCreate = async (addressCreateRequest: AddressCreateRequest, oldUser: User) => {
    const user = clone(oldUser);

    const address = new UserAddress();
    address.addressName = addressCreateRequest.addressName;
    address.city = addressCreateRequest.city;
    address.zip = addressCreateRequest.zip;
    address.country = addressCreateRequest.country;
    address.street = addressCreateRequest.street;
    address.user = user;

    if (addressCreateRequest.address) {
      address.address = addressCreateRequest.address;
    }

    if (addressCreateRequest.state) {
      address.state = addressCreateRequest.state;
    }

    user.addresses = [...(user.addresses || []), address];

    await this.dataSource.getRepository(User).save(user);
    await this.dataSource.getRepository(UserAddress).save(address);
  };

  addressUpdate = async (
    addressCreateRequest: AddressUpdateRequest,
    oldUser: User,
    oldAddress: UserAddress,
  ) => {
    const user = clone(oldUser);
    const address = clone(oldAddress);

    if (addressCreateRequest.addressName) {
      address.addressName = addressCreateRequest.addressName;
    }

    if (addressCreateRequest.city) {
      address.city = addressCreateRequest.city;
    }

    if (addressCreateRequest.zip) {
      address.zip = addressCreateRequest.zip;
    }

    if (addressCreateRequest.country) {
      address.country = addressCreateRequest.country;
    }

    if (addressCreateRequest.street) {
      address.street = addressCreateRequest.street;
    }

    if (addressCreateRequest.address) {
      address.address = addressCreateRequest.address;
    }

    if (addressCreateRequest.state) {
      address.state = addressCreateRequest.state;
    }

    user.addresses = [...(user.addresses || []), address];

    await this.dataSource.getRepository(User).save(user);
    await this.dataSource.getRepository(UserAddress).save(address);
  };

  addressDelete = async (oldAddress: UserAddress, oldUser: User) => {
    const user = clone(oldUser);
    const address = clone(oldAddress);

    user.addresses = (user?.addresses || []).filter((userAddress) => userAddress.id !== address.id);
    await this.dataSource.getRepository(User).save(user);

    await this.dataSource
      .getRepository(UserAddress)
      .createQueryBuilder()
      .softDelete()
      .from(UserAddress)
      .where('id = :id', { id: address.id })
      .execute();
  };

  creditCardCreate = async (creditCardCreateRequest: CreditCardCreateRequest, oldUser: User) => {
    const user = clone(oldUser);

    const creditCard = new CreditCard();
    creditCard.creditCardName = creditCardCreateRequest.creditCardName;
    creditCard.last4Digits = creditCardCreateRequest.cardNumber.slice(-4);
    creditCard.cardHolderNameAnonymized = anonymizeNames(creditCardCreateRequest.cardHolderName);
    creditCard.cardHolderName = await hash(creditCardCreateRequest.cardHolderName, 12);
    creditCard.cardNumber = await hash(creditCardCreateRequest.cardNumber, 12);
    creditCard.expirationDate = await hash(creditCardCreateRequest.expirationDate, 12);
    creditCard.cvv = await hash(creditCardCreateRequest.cvv, 12);
    creditCard.user = user;

    user.creditCards = [...(user.creditCards || []), creditCard];
    await this.dataSource.getRepository(User).save(user);
    const savedCreditCard = await this.dataSource.getRepository(CreditCard).save(creditCard);
    return savedCreditCard.id;
  };

  creditCardDelete = async (oldCreditCard: CreditCard, oldUser: User) => {
    const creditCard = clone(oldCreditCard);
    const user = clone(oldUser);

    user.creditCards = (user?.creditCards || []).filter(
      (userCreditCard) => userCreditCard.id !== creditCard.id,
    );
    await this.dataSource.getRepository(User).save(user);

    await this.dataSource
      .getRepository(CreditCard)
      .createQueryBuilder()
      .softDelete()
      .from(CreditCard)
      .where('id = :id', { id: creditCard.id })
      .execute();
  };

  realNameCreate = async (realName: string, oldUser: User) => {
    const user = clone(oldUser);
    user.realName = realName;

    await this.dataSource.getRepository(User).save(user);
  };

  influencerRealNameCreate = async (realName: string, oldInfluencer: Influencer) => {
    const influencer = clone(oldInfluencer);
    influencer.realName = realName;

    await this.dataSource.getRepository(Influencer).save(influencer);
  };

  userImageCreate = async (image: string, oldUser: User) => {
    const user = clone(oldUser);

    if (user?.imageLocation) {
      await this.imageUploader.deleteImage(user?.imageLocation);
      user.imageLocation = await this.imageUploader.uploadImage(image, 'influshop_profile_images');
    } else {
      user.imageLocation = await this.imageUploader.uploadImage(image, 'influshop_profile_images');
    }

    await this.dataSource.getRepository(User).save(user);
  };

  influencerImageCreate = async (image: string, oldInfluencer: Influencer) => {
    const influencer = clone(oldInfluencer);

    if (influencer?.imageLocation) {
      await this.imageUploader.deleteImage(influencer?.imageLocation);
      influencer.imageLocation = await this.imageUploader.uploadImage(image, 'influshop_profile_images');
    } else {
      influencer.imageLocation = await this.imageUploader.uploadImage(image, 'influshop_profile_images');
    }

    await this.dataSource.getRepository(Influencer).save(influencer);
  };
}
