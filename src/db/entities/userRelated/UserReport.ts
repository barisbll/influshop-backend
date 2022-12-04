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
import Admin from '../adminRelated/Admin';
import Influencer from '../influencerRelated/Influencer';
import User from './User';

// eslint-disable-next-line no-shadow
export enum UserReportEnum {
  INAPPROPRIATE_USERNAME = 'INAPPROPRIATE_USERNAME',
  INAPPROPRIATE_IMAGE = 'INAPPROPRIATE_IMAGE',
  OTHER = 'OTHER',
}

@Entity('user_report')
export default class UserReport {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    type: 'enum',
    enum: UserReportEnum,
  })
  report?: string;

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

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.selfReports)
  reportedUser?: User;

  @ManyToOne(() => User, (user) => user.userReports, {
    nullable: true,
  })
  reporterUser?: User;

  @ManyToOne(() => Influencer, (influencer) => influencer.userReports, {
    nullable: true,
  })
  reporterInfluencer?: Influencer;

  @ManyToOne(() => Admin, (admin) => admin.userReports, {
    nullable: true,
  })
  admin?: Admin;
}
