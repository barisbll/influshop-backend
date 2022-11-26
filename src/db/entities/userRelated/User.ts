import { Entity, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import Person from '../baseEntities/Person';
import InfluencerReport from '../influencerRelated/InfluencerReport';
import HistoricalRecord from '../general/HistoricalRecord';
import CartItem from './CartItem';
import Favorite from './Favorite';
import UserReport from './UserReport';
import ItemReport from '../itemRelated/ItemReport';
import CommentReport from '../itemRelated/CommentReport';
import ItemStar from '../itemRelated/ItemStar';
import Comment from '../itemRelated/Comment';
import CommentLike from '../itemRelated/CommentLike';
import UserAddress from './UserAddress';
import CreditCard from './CreditCard';
import MessageHistory from '../messageRelated/MessageHistory';

@Entity('user')
export default class User extends Person {
  @OneToOne(() => Favorite, (favorite) => favorite.user)
  @JoinColumn()
  favorite?: Favorite;

  @OneToMany(
    () => InfluencerReport,
    (influencerReport) => influencerReport.reporterUser,
    {
      nullable: true,
      onDelete: 'NO ACTION',
    },
  )
  influencerReports?: InfluencerReport[];

  @OneToMany(() => ItemReport, (itemReport) => itemReport.reporterUser, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  itemReports?: ItemReport[];

  @OneToMany(
    () => CommentReport,
    (commentReport) => commentReport.reporterUser,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  commentReports?: CommentReport[];

  @OneToMany(() => UserReport, (userReport) => userReport.reporterUser, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  userReports?: UserReport[];

  @OneToMany(() => UserReport, (userReport) => userReport.reportedUser, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  selfReports?: UserReport[];

  @OneToMany(
    () => HistoricalRecord,
    (historicalRecord) => historicalRecord.user,
    {
      nullable: true,
      onDelete: 'NO ACTION',
    },
  )
  historicalRecords?: HistoricalRecord[];

  @OneToMany(() => ItemStar, (itemStar) => itemStar.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  itemStars?: ItemStar[];

  @OneToMany(() => Comment, (comment) => comment.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  comments?: Comment[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  commentLikes?: CommentLike[];

  @OneToMany(() => UserAddress, (userAddress) => userAddress.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  addresses?: UserAddress[];

  @OneToMany(() => CreditCard, (creditCard) => creditCard.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  creditCards?: CreditCard[];

  @OneToMany(() => MessageHistory, (messageHistory) => messageHistory.user, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  messageHistories?: MessageHistory[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  cartItems?: CartItem[];
}
