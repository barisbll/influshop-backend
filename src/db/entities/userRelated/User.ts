import { Entity, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import Person from '../baseEntities/Person';
import InfluencerReport from '../influencerRelated/InfluencerReport';
import HistoricalRecord from '../general/HistoricalRecord';
import Cart from './Cart';
import Favorite from './Favorite';
import UserReport from './UserReport';

@Entity('user')
export default class User extends Person {
  @OneToOne(() => Cart, (cart) => cart.user)
  @JoinColumn()
  cart?: Cart;

  @OneToOne(() => Favorite, (favorite) => favorite.user)
  @JoinColumn()
  favorite?: Favorite;

  @OneToMany(
    () => InfluencerReport,
    (influencerReport) => influencerReport.reporterUser,
  )
  influencerReports?: InfluencerReport[];

  @OneToMany(
    () => HistoricalRecord,
    (historicalRecord) => historicalRecord.user,
  )
  historicalRecords?: HistoricalRecord[];

  @OneToMany(() => UserReport, (userReport) => userReport.reporterUser)
  userReports?: UserReport[];

  @OneToMany(() => UserReport, (userReport) => userReport.reportedUser)
  selfReports?: UserReport[];
}
