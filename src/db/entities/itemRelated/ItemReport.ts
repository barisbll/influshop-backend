/* eslint-disable no-unused-vars */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import Influencer from '../influencerRelated/Influencer';
import User from '../userRelated/User';

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

  @Column({
    default: false,
  })
  isReportControlled?: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @ManyToOne(() => User, (user) => user.itemReports, {
    nullable: true,
  })
  reporterUser?: User;

  @ManyToOne(() => Influencer, (influencer) => influencer.itemReports, {
    nullable: true,
  })
  reporterInfluencer?: Influencer;
}
