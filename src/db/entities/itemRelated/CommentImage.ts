import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, DeleteDateColumn } from 'typeorm';
import Comment from './Comment';

@Entity('comment_image')
export default class CommentImage {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  imageLocation?: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Comment, (comment) => comment.commentImages)
  comment?: Comment;
}
