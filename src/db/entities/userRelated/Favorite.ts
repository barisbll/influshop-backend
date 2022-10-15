import {
  Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';

import Item from '../itemRelated/Item';
import User from './User';

@Entity('favorite')
export default class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @OneToOne(() => User)
  @JoinColumn()
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
