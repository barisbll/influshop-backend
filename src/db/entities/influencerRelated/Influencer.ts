import { Entity, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsHexColor, Length } from 'class-validator';
import Category from './Category';
import Item from '../itemRelated/Item';
import Person from '../baseEntities/Person';
import InfluencerReport from './InfluencerReport';
import UserReport from '../userRelated/UserReport';
import HistoricalRecord from '../general/HistoricalRecord';
import ItemReport from '../itemRelated/ItemReport';
import InfluencerAddress from './InfluencerAddress';
import MessageHistory from '../messageRelated/MessageHistory';

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

  @OneToOne(() => Item, {
    nullable: true,
  })
  @JoinColumn()
  pinnedItem?: Item;

  @OneToMany(() => Category, (category) => category.influencer, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  categories?: Category[];

  @OneToMany(() => Item, (item) => item.influencer, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  items?: Item[];

  @OneToMany(
    () => InfluencerReport,
    (influencerReport) => influencerReport.reportedInfluencer,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  selfReports?: InfluencerReport[];

  @OneToMany(
    () => InfluencerReport,
    (influencerReport) => influencerReport.reporterInfluencer,
    {
      nullable: true,
      onDelete: 'NO ACTION',
    },
  )
  influencerReports?: InfluencerReport[];

  @OneToMany(() => UserReport, (userReport) => userReport.reporterInfluencer, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  userReports?: UserReport[];

  @OneToMany(() => ItemReport, (itemReport) => itemReport.reporterInfluencer, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  itemReports?: ItemReport[];

  @OneToMany(
    () => HistoricalRecord,
    (historicalRecord) => historicalRecord.influencer,
    {
      nullable: true,
      onDelete: 'NO ACTION',
    },
  )
  historicalRecords?: HistoricalRecord[];

  @OneToMany(
    () => InfluencerAddress,
    (influencerAddress) => influencerAddress.influencer,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  addresses?: InfluencerAddress[];

  @OneToMany(
    () => MessageHistory,
    (messageHistory) => messageHistory.influencer,
    {
      nullable: true,
      onDelete: 'NO ACTION',
    },
  )
  messageHistories?: MessageHistory[];
}
