import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import User from '../userRelated/User';
import Item from './Item';

import { Stars } from '../../../config/types';

@Entity('item_star')
export default class ItemStar {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    type: 'enum',
    enum: Stars,
  })
  stars?: number;

  @ManyToOne(() => User, (user) => user.itemStars)
  user?: User;

  @ManyToOne(() => Item, (item) => item.itemStars)
  item?: Item;
}
