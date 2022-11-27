import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './User';

@Entity('credit_card')
export default class CreditCard {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  creditCardName?: string;

  @Column()
  cardNumber?: string;

  @Column()
  cardHolderName?: string;

  @Column()
  cardHolderNameAnonymized?: string;

  @Column()
  expirationDate?: string;

  @Column()
  cvv?: string;

  @Column()
  last4Digits?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.creditCards)
  user?: User;
}
