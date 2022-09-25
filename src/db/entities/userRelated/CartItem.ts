import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import Cart from './Cart';
import Item from '../itemRelated/Item';

@Entity('cart_item')
export default class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  quantity?: number;

  @ManyToOne(() => Cart, (cart) => cart.cartItems, {
    onDelete: 'CASCADE',
    })
  cart?: Cart;

  @ManyToOne(() => Item, (item) => item.cartItems, {
    onDelete: 'CASCADE',
    })
  item?: Item;
}
