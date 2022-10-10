/* eslint-disable no-unused-vars */
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import User from '../userRelated/User';
import Influencer from './Influencer';

// eslint-disable-next-line no-shadow
export enum InfluencerReportEnum {
  INAPPROPRIATE_USERNAME = 'INAPPROPRIATE_USERNAME',
  INAPPROPRIATE_IMAGE = 'INAPPROPRIATE_IMAGE',
  INAPPROPRIATE_SHOP_DESCRIPTION = 'INAPPROPRIATE_SHOP_DESCRIPTION',
  OTHER = 'OTHER',
}

@Entity('influencer_report')
export default class InfluencerReport {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    type: 'enum',
    enum: InfluencerReportEnum,
  })
  report?: string;

  @Column({
    default: null,
    nullable: true,
  })
  isReportControlled?: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Influencer, (influencer) => influencer.selfReports)
  reportedInfluencer?: Influencer;

  @ManyToOne(() => Influencer, (influencer) => influencer.influencerReports, {
    nullable: true,
  })
  reporterInfluencer?: Influencer;

  @ManyToOne(() => User, (user) => user.influencerReports, {
    nullable: true,
  })
  reporterUser?: User;
}
