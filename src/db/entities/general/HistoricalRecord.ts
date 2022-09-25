import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import Influencer from '../influencerRelated/Influencer';
import Item from '../itemRelated/Item';
import User from '../userRelated/User';

@Entity('historical_record')
export default class HistoricalRecord {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    type: 'numeric',
  })
  price?: number;

  @Column({
    default: 1,
  })
  quantity?: number;

  @Column({
    default: true,
  })
  isPurchaseCompleted?: boolean;

  @CreateDateColumn()
  purchaseDate?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @ManyToOne(() => Influencer, (influencer) => influencer.historicalRecords)
  @JoinColumn({ name: 'influencer_id' })
  influencer?: Influencer;

  @ManyToOne(() => Item, (item) => item.historicalRecords)
  @JoinColumn({ name: 'item_id' })
  item?: Item;

  @ManyToOne(() => User, (user) => user.historicalRecords)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
