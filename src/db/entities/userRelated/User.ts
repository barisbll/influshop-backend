import { Entity, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import Person from '../baseEntities/Person';
import InfluencerReport from '../influencerRelated/InfluencerReport';
import HistoricalRecord from '../general/HistoricalRecord';
import Cart from './Cart';
import Favorite from './Favorite';
import UserReport from './UserReport';
import ItemReport from '../itemRelated/ItemReport';
import CommentReport from '../itemRelated/CommentReport';
import ItemStar from '../itemRelated/ItemStar';
import Comment from '../itemRelated/Comment';
import CommentLike from '../itemRelated/CommentLike';
import CommentImage from '../itemRelated/CommentImage';
import UserAddress from './UserAddress';
import CreditCard from './CreditCard';
import MessageHistory from '../messageRelated/MessageHistory';

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
    {
      nullable: true,
    },
  )
  influencerReports?: InfluencerReport[];

  @OneToMany(() => ItemReport, (itemReport) => itemReport.reporterUser, {
    nullable: true,
  })
  itemReports?: ItemReport[];

  @OneToMany(
    () => CommentReport,
    (commentReport) => commentReport.reporterUser,
    {
      nullable: true,
    },
  )
  commentReports?: CommentReport[];

  @OneToMany(() => UserReport, (userReport) => userReport.reporterUser, {
    nullable: true,
  })
  userReports?: UserReport[];

  @OneToMany(() => UserReport, (userReport) => userReport.reportedUser, {
    nullable: true,
  })
  selfReports?: UserReport[];

  @OneToMany(
    () => HistoricalRecord,
    (historicalRecord) => historicalRecord.user,
    {
      nullable: true,
    },
  )
  historicalRecords?: HistoricalRecord[];

  @OneToMany(() => ItemStar, (itemStar) => itemStar.user, {
    nullable: true,
  })
  itemStars?: ItemStar[];

  @OneToMany(() => Comment, (comment) => comment.user, {
    nullable: true,
  })
  comments?: Comment[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.user, {
    nullable: true,
  })
  commentLikes?: CommentLike[];

  @OneToMany(() => CommentImage, (commentImage) => commentImage.user, {
    nullable: true,
  })
  commentImages?: CommentImage[];

  @OneToMany(() => UserAddress, (userAddress) => userAddress.user, {
    nullable: true,
  })
  addresses?: UserAddress[];

  @OneToMany(() => CreditCard, (creditCard) => creditCard.user, {
    nullable: true,
  })
  creditCards?: CreditCard[];

  @OneToMany(() => MessageHistory, (messageHistory) => messageHistory.user, {
    nullable: true,
  })
  messageHistories?: MessageHistory[];
}
