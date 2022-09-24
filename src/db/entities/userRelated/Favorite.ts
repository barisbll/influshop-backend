import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import User from './User';
import Item from '../itemRelated/Item';

@Entity('favorite')
export default class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @OneToOne(() => User)
  user?: User;

  @ManyToMany(() => Item)
  @JoinTable({
    name: 'favorite_item',
    joinColumn: {
      name: 'favorite_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'item_id',
      referencedColumnName: 'id',
    },
  })
  items?: Item[];
}
