import { IsEmail, Length } from 'class-validator';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import InfluencerReport from '../influencerRelated/InfluencerReport';
import CommentReport from '../itemRelated/CommentReport';
import ItemReport from '../itemRelated/ItemReport';
import MessageReport from '../messageRelated/Message';
import UserReport from '../userRelated/UserReport';

@Entity()
export default class Admin {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    unique: true,
  })
  @Length(1, 16)
  username?: string;

  @Column({
    unique: true,
  })
  @IsEmail()
  email?: string;

  @Column()
  @Length(8, 20)
  password?: string;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @OneToMany(() => CommentReport, (commentReport) => commentReport.admin, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  commentReports?: CommentReport[];

  @OneToMany(() => ItemReport, (itemReport) => itemReport.admin, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  itemReports?: ItemReport[];

  @OneToMany(() => InfluencerReport, (influencerReport) => influencerReport.admin, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  influencerReports?: InfluencerReport[];

  @OneToMany(() => UserReport, (userReport) => userReport.admin, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  userReports?: UserReport[];

  @OneToMany(() => MessageReport, (messageReport) => messageReport.admin, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  messageReports?: MessageReport[];
}
