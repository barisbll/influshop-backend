import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Length } from 'class-validator';
import Address from '../baseEntities/Address';
import Influencer from './Influencer';

@Entity('influencer_address')
export default class InfluencerAddress extends Address {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  @Length(1, 32)
  addressName?: string;

  @ManyToOne(() => Influencer, (influencer) => influencer.addresses)
  influencer?: Influencer;
}
