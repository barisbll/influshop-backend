import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Comment from './Comment';

@Entity('comment_image')
export default class CommentImage {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  imageLocation?: string;

  @ManyToOne(() => Comment, (comment) => comment.commentImages)
  comment?: Comment;
}
