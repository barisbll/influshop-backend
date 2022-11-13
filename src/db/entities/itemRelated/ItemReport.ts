/* eslint-disable no-unused-vars */
import {
  Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

import Admin from '../adminRelated/Admin';
import Influencer from '../influencerRelated/Influencer';
import User from '../userRelated/User';
import Item from './Item';

// eslint-disable-next-line no-shadow
export enum ItemReportEnum {
  INAPPROPRIATE_TITLE = 'INAPPROPRIATE_TITLE',
  INAPPROPRIATE_DESCRIPTION = 'INAPPROPRIATE_DESCRIPTION',
  INAPPROPRIATE_IMAGE = 'INAPPROPRIATE_IMAGE',
  OTHER = 'OTHER',
}

@Entity('item_report')
export default class ItemReport {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    type: 'enum',
    enum: ItemReportEnum,
  })
  report?: string;

  @Index()
  @Column({
    default: false,
  })
  isReportControlled?: boolean;

  @Column({
    nullable: true,
    default: null,
  })
  isApproved?: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @ManyToOne(() => Item, (item) => item.itemReports)
  item?: Item;

  @ManyToOne(() => User, (user) => user.itemReports, {
    nullable: true,
  })
  reporterUser?: User;

  @ManyToOne(() => Influencer, (influencer) => influencer.itemReports, {
    nullable: true,
  })
  reporterInfluencer?: Influencer;

  @ManyToOne(() => Admin, (admin) => admin.itemReports, {
    nullable: true,
  })
  admin?: Admin;
}
