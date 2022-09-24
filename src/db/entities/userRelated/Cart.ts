import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import User from './User';
import Item from '../itemRelated/Item';

@Entity('cart')
export default class Cart {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @OneToOne(() => User)
  user?: User;

  @ManyToMany(() => Item)
  @JoinTable({
    name: 'cart_item',
    joinColumn: {
      name: 'cart_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'item_id',
      referencedColumnName: 'id',
    },
  })
  items?: Item[];
}
