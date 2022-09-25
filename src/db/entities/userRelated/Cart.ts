import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

import User from './User';
import CartItem from './CartItem';

@Entity('cart')
export default class Cart {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @OneToOne(() => User)
  user?: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    nullable: true,
    onDelete: 'CASCADE',
    })
  cartItems?: CartItem[];
}
