import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Address from '../baseEntities/Address';
import Influencer from './Influencer';

@Entity('influencer_address')
export default class InfluencerAddress extends Address {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ManyToOne(() => Influencer, (influencer) => influencer.addresses)
  influencer?: Influencer;
}
