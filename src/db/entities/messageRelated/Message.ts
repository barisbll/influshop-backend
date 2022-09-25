/* eslint-disable no-unused-vars */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import MessageHistory from './MessageHistory';
import MessageImage from './MessageImage';

// eslint-disable-next-line no-shadow
export enum MessageReport {
  INAPPROPRIATE_IMAGE = 'INAPPROPRIATE_IMAGE',
  THREATENING = 'THREATENING',
  INSULTING = 'INSULTING',
  OTHER = 'OTHER',
}

@Entity('message')
export default class Message {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  message?: string;

  @Column()
  isEdited?: boolean;

  @Column()
  isDeleted?: boolean;

  @Column({
    nullable: true,
    default: null,
    type: 'enum',
    enum: MessageReport,
  })
  report?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @OneToMany(() => MessageImage, (messageImage) => messageImage.message, {
    nullable: true,
  })
  images?: MessageImage[];

  @ManyToOne(() => MessageHistory, (messageHistory) => messageHistory.messages)
  messageHistory?: MessageHistory;
}
