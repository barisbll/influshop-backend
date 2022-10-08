import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import User from '../userRelated/User';
import Comment from './Comment';

@Entity('comment_like')
export default class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  isLike?: boolean;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Comment, (comment) => comment.commentLikes)
  comment?: Comment;

  @ManyToOne(() => User, (user) => user.commentLikes)
  user?: User;
}
