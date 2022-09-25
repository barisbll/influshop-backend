import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Min, Max } from 'class-validator';
import Item from './Item';

@Entity('item_image')
export default class ItemImage {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  imageLocation?: string;

  @Column()
  @Min(1)
  @Max(10)
  imageOrder?: number;

  @ManyToOne(() => Item, (item) => item.images)
  item?: Item;
}
