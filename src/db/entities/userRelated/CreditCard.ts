import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column()
  lastUsageDate?: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.creditCards)
  user?: User;
}
