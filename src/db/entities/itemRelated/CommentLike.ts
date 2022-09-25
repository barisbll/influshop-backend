import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import Comment from './Comment';
import User from '../userRelated/User';

@Entity('comment_like')
export default class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  isLike?: boolean;

  @ManyToOne(() => Comment, (comment) => comment.commentLikes)
  comment?: Comment;

  @ManyToOne(() => User, (user) => user.commentLikes)
  user?: User;
}
