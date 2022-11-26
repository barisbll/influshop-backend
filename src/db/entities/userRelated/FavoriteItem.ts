import { Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

import Item from '../itemRelated/Item';
import User from './User';

@Entity('favorite_item')
export default class FavoriteItem {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ManyToOne(() => User, (user) => user.favoriteItems)
  user?: User;

  @ManyToOne(() => Item, (item) => item.favoriteItems)
  item?: Item;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
