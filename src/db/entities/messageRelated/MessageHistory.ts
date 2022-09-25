import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import Influencer from '../influencerRelated/Influencer';
import User from '../userRelated/User';
import Message from './Message';

@Entity('message_history')
export default class MessageHistory {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @OneToMany(() => Message, (message) => message.messageHistory)
  messages?: Message[];

  @ManyToOne(() => User, (user) => user.messageHistories)
  user?: User;

  @ManyToOne(() => Influencer, (influencer) => influencer.messageHistories)
  influencer?: Influencer;
}
