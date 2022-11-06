import { Length } from 'class-validator';
import {
  Column,
  CreateDateColumn, DeleteDateColumn, Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Influencer from '../influencerRelated/Influencer';
import Item from './Item';

@Entity('item_group')
export default class ItemGroup {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  @Length(4, 20)
  itemGroupName?: string;

  @Column({
    nullable: true,
  })
  @Length(1, 280)
  itemGroupDescription?: string;

  @Column({
    nullable: true,
    default: null,
  })
  imageLocation?: string;

  @Column({
    default: true,
  })
  isVisible?: boolean;

  @Column({
    type: 'simple-json',
  })
  extraFeatures?: any;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => Item, (item) => item.itemGroup, {
    nullable: true,
  })
  items?: Item[];

  @ManyToOne(() => Influencer, (influencer) => influencer.itemGroups)
  influencer?: Influencer;
}
