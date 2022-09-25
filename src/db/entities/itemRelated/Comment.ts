import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Length } from 'class-validator';
import User from '../userRelated/User';
import Item from './Item';
import CommentLike from './CommentLike';
import CommentImage from './CommentImage';
import CommentReport from './CommentReport';

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

  @OneToMany(() => CommentLike, (commentLike) => commentLike.comment, {
    nullable: true,
  })
  commentLikes?: CommentLike[];

  @OneToMany(() => CommentImage, (commentImage) => commentImage.comment, {
    nullable: true,
  })
  commentImages?: CommentImage[];

  @OneToMany(() => CommentReport, (commentReport) => commentReport.comment, {
    nullable: true,
  })
  commentReports?: CommentReport[];

  @ManyToOne(() => User, (user) => user.comments)
  user?: User;

  @ManyToOne(() => Item, (item) => item.comments)
  item?: Item;
}
