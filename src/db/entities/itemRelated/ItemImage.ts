import { Max, Min } from 'class-validator';
import {
  Column, CreateDateColumn, Entity,
  ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import Item from './Item';

@Entity('item_image')
export default class ItemImage {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  imageLocation?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @Column()
  @Min(1)
  @Max(5)
  imageOrder?: number;

  @ManyToOne(() => Item, (item) => item.images)
  item?: Item;
}
