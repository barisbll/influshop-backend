import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Min } from 'class-validator';
import Item from '../itemRelated/Item';
import User from './User';

@Entity('cart_item')
export default class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Min(1)
  @Column()
  quantity?: number;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.cartItems)
  user?: User;

  @ManyToOne(() => Item, (item) => item.cartItems)
  item?: Item;
}
