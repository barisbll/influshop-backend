import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import Message from './Message';

@Entity('message_image')
export default class MessageImage {
  @PrimaryGeneratedColumn('uuid')
  id?: number;

  @Column()
  imageLocation?: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Message, (message) => message.images)
  message?: Message;
}
