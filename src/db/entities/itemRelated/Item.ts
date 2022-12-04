import { Length, Max, Min } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import HistoricalRecord from '../general/HistoricalRecord';
import Category from '../influencerRelated/Category';
import Influencer from '../influencerRelated/Influencer';
import CartItem from '../userRelated/CartItem';
import FavoriteItem from '../userRelated/FavoriteItem';
import Comment from './Comment';
import ItemGroup from './ItemGroup';
import ItemImage from './ItemImage';
import ItemReport from './ItemReport';
import ItemStar from './ItemStar';

@Entity('item')
export default class Item {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  @Length(4, 20)
  itemName?: string;

  @Column({
    default: 1,
  })
  @Min(0)
  @Max(50000)
  itemQuantity?: number;

  @Column({
    nullable: true,
  })
  @Length(1, 280)
  itemDescription?: string;

  @Min(1)
  @Max(50000)
  @Column({
    type: 'numeric',
  })
  itemPrice?: number;

  @Min(1)
  @Max(5)
  @Column({
    nullable: true,
    type: 'numeric',
  })
  averageStars?: number;

  @Column({
    default: 0,
  })
  totalComments?: number;

  @Column({
    default: true,
  })
  isVisible?: boolean;

  // featureName: value
  @Column({
    type: 'simple-json',
    nullable: true,
  })
  extraFeatures?: any;

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

  @OneToMany(() => FavoriteItem, (favoriteItem) => favoriteItem.item, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  favoriteItems?: FavoriteItem[];

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

  @OneToMany(() => ItemReport, (itemReport) => itemReport.item, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  itemReports?: ItemReport[];

  @ManyToOne(() => Influencer, (influencer) => influencer.items)
  influencer?: Influencer;

  @ManyToOne(() => ItemGroup, (itemGroup) => itemGroup.items, {
    nullable: true,
  })
  itemGroup?: ItemGroup;

  @ManyToMany(() => Category, (category) => category.items, {
    nullable: true,
  })
  categories?: Category[];
}
