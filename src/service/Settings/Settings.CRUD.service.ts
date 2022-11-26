/* eslint-disable no-else-return */
import clone from 'clone';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import User from '../../db/entities/userRelated/User';
import {
  AddressCreateRequest,
  AddressUpdateRequest,
} from '../../api/rest/v1/controllers/Settings/Settings.type';
import UserAddress from '../../db/entities/userRelated/UserAddress';

@Service()
export class SettingsCRUDService {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = Container.get('dataSource');
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
}
