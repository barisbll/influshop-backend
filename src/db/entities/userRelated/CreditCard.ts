import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
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
  expirationDate?: string;

  @Column()
  cvv?: string;

  @ManyToOne(() => User, (user) => user.creditCards)
  user?: User;
}
