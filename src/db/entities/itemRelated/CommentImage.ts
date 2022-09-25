import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import Comment from './Comment';
import User from '../userRelated/User';

@Entity('comment_image')
export default class CommentImage {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  imageLocation?: string;

  @ManyToOne(() => Comment, (comment) => comment.commentImages)
  comment?: Comment;

  @ManyToOne(() => User, (user) => user.commentImages)
  user?: User;
}
