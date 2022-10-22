import { IsEmail, IsFQDN, Length, MaxDate, MinDate } from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export default class Person extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    unique: true,
  })
  @Length(4, 20)
  username?: string;

  @Column({
    nullable: true,
  })
  @MinDate(new Date('January 1, 1960'))
  @MaxDate(new Date(Date.now()))
  birthDate?: Date;

  @Column({
    unique: true,
  })
  @IsEmail()
  email?: string;

  @Column()
  @Length(8, 20)
  password?: string;

  @Column({
    nullable: true,
  })
  imageLocation?: string;

  @Column({
    nullable: true,
  })
  phoneNumber?: string;

  @Column({
    nullable: true,
  })
  facebookLink?: string;

  @Column({
    nullable: true,
  })
  instagramLink?: string;

  @Column({
    nullable: true,
  })
  twitterLink?: string;

  @Column({
    nullable: true,
  })
  youtubeLink?: string;

  @Column({
    nullable: true,
  })
  tiktokLink?: string;

  @Column({
    nullable: true,
  })
  twitchLink?: string;

  @Column({
    nullable: true,
  })
  @IsFQDN()
  personalWebsiteLink?: string;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
