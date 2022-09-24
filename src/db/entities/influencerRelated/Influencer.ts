import { Entity, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsHexColor, Length } from 'class-validator';
import Category from './Category';
import Item from '../itemRelated/Item';
import Person from '../baseEntities/Person';
import InfluencerReport from './InfluencerReport';
import UserReport from '../userRelated/UserReport';
import HistoricalRecord from '../general/HistoricalRecord';

@Entity('influencer')
export default class Influencer extends Person {
  @Column({
    nullable: true,
    default: null,
  })
  @IsHexColor()
  themeColor?: string;

  @Column({
    nullable: true,
  })
  @Length(1, 280)
  shopDescription?: string;

  @OneToMany(() => Category, (category) => category.influencer, {
    nullable: true,
  })
  categories?: Category[];

  @OneToMany(() => Item, (item) => item.influencer, {
    nullable: true,
  })
  items?: Item[];

  @OneToOne(() => Item, {
    nullable: true,
  })
  @JoinColumn()
  pinnedItem?: Item;

  @OneToMany(
    () => InfluencerReport,
    (influencerReport) => influencerReport.reportedInfluencer,
  )
  selfReports?: InfluencerReport[];

  @OneToMany(
    () => InfluencerReport,
    (influencerReport) => influencerReport.reporterInfluencer,
  )
  influencerReports?: InfluencerReport[];

  @OneToMany(
    () => UserReport,
    (userReport) => userReport.reporterInfluencer,
  )
  userReports?: UserReport[];

  @OneToMany(
    () => HistoricalRecord,
    (historicalRecord) => historicalRecord.influencer,
  )
  historicalRecords?: HistoricalRecord[];
}
