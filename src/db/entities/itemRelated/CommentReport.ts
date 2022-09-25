/* eslint-disable no-unused-vars */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

import Comment from './Comment';
import User from '../userRelated/User';

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

  @ManyToOne(() => User, (user) => user.commentReports)
  reporterUser?: User;

  @ManyToOne(() => Comment, (comment) => comment.commentReports)
  comment?: Comment;
}
