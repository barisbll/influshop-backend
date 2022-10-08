import { Length } from 'class-validator';
import {
  Column,
  CreateDateColumn, Entity,
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

  @Column({
    unique: true,
  })
  @Length(1, 64)
  itemGroupName?: string;

  @Column({
    nullable: true,
  })
  imageLocation?: string;

  @Column({
    default: true,
  })
  isVisible?: boolean;

  // featureName: Enum array
  @Column({
    type: 'simple-json',
  })
  extraFeatures?: any;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @OneToMany(() => Item, (item) => item.itemGroup, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  items?: Item[];

  @ManyToOne(() => Influencer, (influencer) => influencer.itemGroups)
  influencer?: Influencer;
}
