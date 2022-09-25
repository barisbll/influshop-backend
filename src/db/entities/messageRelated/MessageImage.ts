import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import Message from './Message';

@Entity('message_image')
export default class MessageImage {
  @PrimaryGeneratedColumn('uuid')
  id?: number;

  @Column()
  imageLocation?: string;

  @ManyToOne(() => Message, (message) => message.images)
  message?: Message;
}
