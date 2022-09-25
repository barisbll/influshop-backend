import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Length } from 'class-validator';
import Address from '../baseEntities/Address';
import User from './User';

@Entity('user_address')
export default class UserAddress extends Address {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  @Length(1, 32)
  addressName?: string;

  @ManyToOne(() => User, (user) => user.addresses)
  user?: User;
}
