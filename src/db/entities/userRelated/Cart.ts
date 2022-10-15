import {
  Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';

import CartItem from './CartItem';
import User from './User';

@Entity('cart')
export default class Cart {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @OneToOne(() => User)
  @JoinColumn()
  user?: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    nullable: true,
    onDelete: 'CASCADE',
    })
  cartItems?: CartItem[];
}
