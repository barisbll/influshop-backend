import { IsHexColor, Length } from 'class-validator';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import Person from '../baseEntities/Person';
import HistoricalRecord from '../general/HistoricalRecord';
import CommentReport from '../itemRelated/CommentReport';
import Item from '../itemRelated/Item';
import ItemGroup from '../itemRelated/ItemGroup';
import ItemReport from '../itemRelated/ItemReport';
import MessageHistory from '../messageRelated/MessageHistory';
import UserReport from '../userRelated/UserReport';
import Category from './Category';
import InfluencerAddress from './InfluencerAddress';
import InfluencerReport from './InfluencerReport';

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
    () => CommentReport,
    (commentReport) => commentReport.reporterInfluencer,
    {
      nullable: true,
      onDelete: 'NO ACTION',
    },
  )
  commentReports?: CommentReport[];

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

  @OneToMany(() => ItemGroup, (itemGroup) => itemGroup.influencer, {
    onDelete: 'CASCADE',
  })
  itemGroups?: ItemGroup[];
}
