/* eslint-disable no-unused-vars */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import Influencer from './Influencer';
import User from '../userRelated/User';

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
    default: false,
  })
  isReportControlled?: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

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
