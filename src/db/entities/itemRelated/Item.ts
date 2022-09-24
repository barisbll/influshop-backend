import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Min, Length } from 'class-validator';
import { Stars } from '../../../config/types';
import Influencer from '../influencerRelated/Influencer';
import Category from '../influencerRelated/Category';
import HistoricalRecord from '../general/HistoricalRecord';
import Cart from '../userRelated/Cart';
import Favorite from '../userRelated/Favorite';

@Entity('item')
export default class Item {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    unique: true,
  })
  @Length(1, 64)
  itemName?: string;

  @Column({
    nullable: true,
  })
  @Min(0)
  itemQuantity?: number;

  @Column({
    nullable: true,
  })
  @Length(1, 280)
  itemDescription?: string;

  @Column({
    type: 'numeric',
  })
  itemPrice?: number;

  @Column({
    type: 'enum',
    enum: Stars,
  })
  averageStars?: number;

  @Column({
    default: true,
  })
  isVisible?: boolean;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @OneToMany(
    () => HistoricalRecord,
    (historicalRecord) => historicalRecord.item,
  )
  historicalRecords?: HistoricalRecord[];

  @ManyToOne(() => Influencer, (influencer) => influencer.items)
  influencer?: Influencer;

  @ManyToMany(() => Category, (category) => category.items)
  categories?: Category[];

  @ManyToMany(() => Cart, (cart) => cart.items)
  carts?: Cart[];

  @ManyToMany(() => Favorite, (favorite) => favorite.items)
  favorites?: Favorite[];
}
