import { Length } from 'class-validator';
import {
  Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne,
  OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import User from '../userRelated/User';
import CommentImage from './CommentImage';
import CommentLike from './CommentLike';
import CommentReport from './CommentReport';
import Item from './Item';

@Entity('comment')
export default class Comment {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  @Length(1, 560)
  comment?: string;

  @Column({
    default: 0,
  })
  likes?: number;

  @Column({
    default: 0,
  })
  dislikes?: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => CommentLike, (commentLike) => commentLike.comment, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  commentLikes?: CommentLike[];

  @OneToMany(() => CommentImage, (commentImage) => commentImage.comment, {
    nullable: true,
  })
  commentImages?: CommentImage[];

  @OneToMany(() => CommentReport, (commentReport) => commentReport.reportedComment, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  commentReports?: CommentReport[];

  @ManyToOne(() => User, (user) => user.comments)
  user?: User;

  @ManyToOne(() => Item, (item) => item.comments)
  item?: Item;
}
