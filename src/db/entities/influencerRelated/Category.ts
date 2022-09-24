import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Min, Max } from 'class-validator';
import Influencer from './Influencer';
import Item from '../itemRelated/Item';

@Entity('category')
export default class Category {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  @Min(1)
  @Max(64)
  name?: string;

  @Column({
    nullable: true,
  })
  categoryHirarchy?: number;

  @Column({
    default: true,
  })
  isVisible?: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @ManyToOne(() => Influencer, (influencer) => influencer.categories)
  @JoinColumn({ name: 'influencer_id' })
  influencer?: Influencer;

  @ManyToMany(() => Item, (item) => item.categories, {
    nullable: true,
  })
  @JoinTable({
    name: 'item_category',
    joinColumn: {
        name: 'category_id',
        referencedColumnName: 'id',
    },
    inverseJoinColumn: {
        name: 'item_id',
        referencedColumnName: 'id',
    },
  })
  items?: Item[];
}
