import { Max, Min } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, DeleteDateColumn } from 'typeorm';
import Comment from './Comment';

@Entity('comment_image')
export default class CommentImage {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  imageLocation?: string;

  @Column()
  @Min(1)
  @Max(5)
  imageOrder?: number;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Comment, (comment) => comment.commentImages)
  comment?: Comment;
}
