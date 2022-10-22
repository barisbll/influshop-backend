/* eslint-disable no-unused-vars */
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import Admin from '../adminRelated/Admin';
import Influencer from '../influencerRelated/Influencer';
import User from '../userRelated/User';
import Comment from './Comment';

// eslint-disable-next-line no-shadow
export enum CommentReportEnum {
  INAPPROPRIATE_COMMENT = 'INAPPROPRIATE_COMMENT',
  INAPPROPRIATE_IMAGE = 'INAPPROPRIATE_IMAGE',
  OTHER = 'OTHER',
}

@Entity('comment_report')
export default class CommentReport {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    type: 'enum',
    enum: CommentReportEnum,
  })
  report?: string;

  @Index()
  @Column({
    default: false,
  })
  isReportControlled?: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.commentReports, {
    nullable: true,
    })
  reporterUser?: User;

  @ManyToOne(() => Influencer, (influencer) => influencer.commentReports, {
    nullable: true,
    })
  reporterInfluencer?: Influencer;

  @ManyToOne(() => Comment, (comment) => comment.commentReports)
  reportedComment?: Comment;

  @ManyToOne(() => Admin, (admin) => admin.commentReports, {
    nullable: true,
  })
  admin?: Admin;
}
