import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Item from '../itemRelated/Item';
import Cart from './Cart';

@Entity('cart_item')
export default class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  quantity?: number;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Cart, (cart) => cart.cartItems)
  cart?: Cart;

  @ManyToOne(() => Item, (item) => item.cartItems)
  item?: Item;
}
