import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Address from '../baseEntities/Address';
import User from './User';

@Entity('user_address')
export default class UserAddress extends Address {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ManyToOne(() => User, (user) => user.addresses)
  user?: User;
}
