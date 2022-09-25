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
import Favorite from '../userRelated/Favorite';
import ItemImage from './ItemImage';
import CartItem from '../userRelated/CartItem';
import ItemStar from './ItemStar';
import Comment from './Comment';

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
    {
      nullable: true,
      onDelete: 'NO ACTION',
    },
  )
  historicalRecords?: HistoricalRecord[];

  @OneToMany(() => ItemImage, (itemImage) => itemImage.item, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  images?: ItemImage[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.item, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  cartItems?: CartItem[];

  @OneToMany(() => ItemStar, (itemStar) => itemStar.item, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  itemStars?: ItemStar[];

  @OneToMany(() => Comment, (comment) => comment.item, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  comments?: Comment[];

  @ManyToOne(() => Influencer, (influencer) => influencer.items)
  influencer?: Influencer;

  @ManyToMany(() => Category, (category) => category.items, {
    nullable: true,
  })
  categories?: Category[];

  @ManyToMany(() => Favorite, (favorite) => favorite.items, {
    nullable: true,
  })
  favorites?: Favorite[];
}
