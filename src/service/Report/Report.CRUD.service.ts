import clone from 'clone';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import HttpStatus from 'http-status-codes';
import {
  ItemReportCreateRequest,
  ItemReportReadRequest,
  ItemReportInspectRequest,
  CommentReportCreateRequest,
  CommentReportReadRequest,
  CommentReportInspectRequest,
  UserReportCreateRequest,
  UserReportReadRequest,
  InfluencerReportCreateRequest,
} from '../../api/rest/v1/controllers/Report/Report.type';
import User from '../../db/entities/userRelated/User';
import Item from '../../db/entities/itemRelated/Item';
import Influencer from '../../db/entities/influencerRelated/Influencer';
import ItemReport from '../../db/entities/itemRelated/ItemReport';
import { CustomError } from '../../util/CustomError';
import Admin from '../../db/entities/adminRelated/Admin';
import logger from '../../config/logger';
import { ItemService } from '../Item.service';
import Comment from '../../db/entities/itemRelated/Comment';
import CommentReport from '../../db/entities/itemRelated/CommentReport';
import { CommentCRUDService } from '../CommentCRUD.service';
import UserReport from '../../db/entities/userRelated/UserReport';
import InfluencerReport from '../../db/entities/influencerRelated/InfluencerReport';

@Service()
export class ReportCRUDService {
  private dataSource: DataSource;
  private itemService: ItemService;
  private commentCRUDService: CommentCRUDService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.itemService = Container.get(ItemService);
    this.commentCRUDService = Container.get(CommentCRUDService);
  }

  itemReportRead = async (
    body: ItemReportReadRequest,
    client: User | Influencer,
    item: Item,
  ): Promise<Partial<ItemReport> | undefined> => {
    // Find the item report inside the client
    const itemReport = (client?.itemReports as ItemReport[]).find(
      (clientItemReport) => (clientItemReport.item as Item)?.id === item?.id,
    );
    if (!itemReport) {
      return undefined;
    }

    const { id, report, isReportControlled, admin, updatedAt } = itemReport as ItemReport;

    return { id, report, isReportControlled, admin, updatedAt };
  };

  createItemReport = async (
    body: ItemReportCreateRequest,
    oldClient: User | Influencer,
    oldItem: Item,
  ): Promise<string> => {
    const item = clone(oldItem);
    const client = clone(oldClient);
    if (body.isReport) {
      // Create or update ItemReport
      const existingItemReport = (client?.itemReports as ItemReport[]).find(
        (clientsItemReport) => (clientsItemReport.item as Item)?.id === item?.id,
      );
      if (existingItemReport) {
        // Update existing ItemReport
        if (existingItemReport.report === body.reason) {
          throw new CustomError(
            'Item Report Cannot Be The Same With The Existing One',
            HttpStatus.BAD_REQUEST,
          );
        }
        existingItemReport.report = body.reason;
        const updatedReport = await this.dataSource
          .getRepository(ItemReport)
          .save(existingItemReport);
        return updatedReport.id as string;
      }
      // Create new ItemReport
      const itemReport = new ItemReport();
      if (body.isReporterUser) {
        itemReport.reporterUser = client as User;
      } else {
        itemReport.reporterInfluencer = client as Influencer;
      }

      itemReport.item = item;
      itemReport.report = body.reason;
      const createdItemReport = await this.dataSource.getRepository(ItemReport).save(itemReport);
      item.itemReports = [...(item.itemReports || []), itemReport];
      await this.dataSource.getRepository(Item).save(item);

      client.itemReports = [...(client.itemReports || []), itemReport];
      if (body.isReporterUser) {
        await this.dataSource.getRepository(User).save(client);
      } else {
        await this.dataSource.getRepository(Influencer).save(client);
      }

      return createdItemReport.id as string;
    }
    // Delete ItemReport
    const existingItemReport = (client?.itemReports as ItemReport[]).find(
      (clientsItemReport) => (clientsItemReport.item as Item).id === item.id,
    );
    if (!existingItemReport) {
      throw new CustomError('Item Previously Not Reported', HttpStatus.BAD_REQUEST);
    }

    item.itemReports = (item.itemReports || []).filter(
      (itemReport) => itemReport.id !== existingItemReport.id,
    );
    await this.dataSource.getRepository(Item).save(item);

    client.itemReports = (client.itemReports || []).filter(
      (itemReport) => itemReport.id !== existingItemReport.id,
    );
    if (body.isReporterUser) {
      await this.dataSource.getRepository(User).save(client);
    } else {
      await this.dataSource.getRepository(Influencer).save(client);
    }

    const deletedItemReport = await this.dataSource
      .getRepository(ItemReport)
      .remove(existingItemReport);
    return deletedItemReport.id as string;
  };

  itemReportInspect = async (
    body: ItemReportInspectRequest,
    oldItem: Item,
    oldAdmin: Admin,
  ): Promise<string> => {
    const item = clone(oldItem);
    const admin = clone(oldAdmin);

    if (body.isApprove) {
      item.itemReports?.forEach(async (oldItemReport) => {
        const itemReport = clone(oldItemReport);
        itemReport.isReportControlled = true;
        itemReport.admin = admin;
        itemReport.isApproved = true;
        await this.dataSource.getRepository(ItemReport).save(itemReport);
      });
      return item.id as string;
    }
    // delete item
    item.itemReports?.forEach(async (oldItemReport) => {
      const itemReport = clone(oldItemReport);
      itemReport.isReportControlled = true;
      itemReport.admin = admin;
      itemReport.isApproved = false;
      await this.dataSource.getRepository(ItemReport).save(itemReport);
    });

    try {
      const influencer = await this.dataSource.getRepository(Influencer).findOne({
        where: { id: (item.influencer as Influencer).id },
      });

      if (!influencer) {
        throw new CustomError('Influencer Not Found', HttpStatus.NOT_FOUND);
      }

      if (item.extraFeatures) {
        await this.itemService.deleteItemWithExtra(influencer, item);
      } else {
        await this.itemService.deleteItem(influencer, item);
      }

      return item.id as string;
    } catch (error) {
      logger.error(error);
      throw new CustomError('Item Delete Failed', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  };

  // Comment Report
  commentReportRead = async (
    body: CommentReportReadRequest,
    client: User | Influencer,
    comment: Comment,
  ): Promise<Partial<CommentReport> | undefined> => {
    // Find the comment report inside the client
    const commentReport = (client?.commentReports as CommentReport[]).find(
      (clientCommentReport) => (clientCommentReport.reportedComment as Comment)?.id === comment?.id,
    );
    if (!commentReport) {
      return undefined;
    }
    const { id, report, isReportControlled, admin, updatedAt } = commentReport as CommentReport;

    return { id, report, isReportControlled, admin, updatedAt };
  };

  createCommentReport = async (
    body: CommentReportCreateRequest,
    oldClient: User | Influencer,
    oldComment: Comment,
  ): Promise<string> => {
    const comment = clone(oldComment);
    const client = clone(oldClient);
    if (body.isReport) {
      // Create or update CommentReport
      const existingCommentReport = (client?.commentReports as CommentReport[]).find(
        (clientsCommentReport) =>
          (clientsCommentReport.reportedComment as Comment)?.id === comment?.id,
      );
      if (existingCommentReport) {
        // Update existing CommentReport
        if (existingCommentReport.report === body.reason) {
          throw new CustomError(
            'Comment Report Cannot Be The Same With The Existing One',
            HttpStatus.BAD_REQUEST,
          );
        }

        existingCommentReport.report = body.reason;
        const updatedReport = await this.dataSource
          .getRepository(CommentReport)
          .save(existingCommentReport);
        return updatedReport.id as string;
      }
      // Create new CommentReport
      const commentReport = new CommentReport();
      if (body.isReporterUser) {
        commentReport.reporterUser = client as User;
      } else {
        commentReport.reporterInfluencer = client as Influencer;
      }

      commentReport.reportedComment = comment;
      commentReport.report = body.reason;
      const createdCommentReport = await this.dataSource
        .getRepository(CommentReport)
        .save(commentReport);

      comment.commentReports = [...(comment.commentReports || []), commentReport];
      await this.dataSource.getRepository(Comment).save(comment);

      client.commentReports = [...(client.commentReports || []), commentReport];
      if (body.isReporterUser) {
        await this.dataSource.getRepository(User).save(client);
      } else {
        await this.dataSource.getRepository(Influencer).save(client);
      }

      return createdCommentReport.id as string;
    }
    // Delete CommentReport
    const existingCommentReport = (client?.commentReports as CommentReport[]).find(
      (clientsCommentReport) => (clientsCommentReport.reportedComment as Comment).id === comment.id,
    );

    if (!existingCommentReport) {
      throw new CustomError('Comment Previously Not Reported', HttpStatus.BAD_REQUEST);
    }

    comment.commentReports = (comment.commentReports || []).filter(
      (commentReport) => commentReport.id !== existingCommentReport.id,
    );
    await this.dataSource.getRepository(Comment).save(comment);

    client.commentReports = (client.commentReports || []).filter(
      (commentReport) => commentReport.id !== existingCommentReport.id,
    );
    if (body.isReporterUser) {
      await this.dataSource.getRepository(User).save(client);
    } else {
      await this.dataSource.getRepository(Influencer).save(client);
    }

    const deletedCommentReport = await this.dataSource
      .getRepository(CommentReport)
      .remove(existingCommentReport);
    return deletedCommentReport.id as string;
  };

  commentReportInspect = async (
    body: CommentReportInspectRequest,
    oldComment: Comment,
    oldAdmin: Admin,
  ): Promise<string> => {
    const comment = clone(oldComment);
    const admin = clone(oldAdmin);

    if (body.isApprove) {
      comment.commentReports?.forEach(async (oldCommentReport) => {
        const commentReport = clone(oldCommentReport);
        commentReport.isReportControlled = true;
        commentReport.admin = admin;
        commentReport.isApproved = true;
        await this.dataSource.getRepository(CommentReport).save(commentReport);
      });
      return comment.id as string;
    }
    // delete item
    comment.commentReports?.forEach(async (oldCommentReport) => {
      const commentReport = clone(oldCommentReport);
      commentReport.isReportControlled = true;
      commentReport.admin = admin;
      commentReport.isApproved = false;
      await this.dataSource.getRepository(CommentReport).save(commentReport);
    });

    try {
      const user = await this.dataSource.getRepository(User).findOne({
        where: {
          id: (comment.user as User).id,
        },
        relations: {
          comments: true,
          commentLikes: true,
        },
      });

      if (!user) {
        throw new CustomError('User Not Found', HttpStatus.NOT_FOUND);
      }

      user.comments = user?.comments?.filter((userComment) => userComment.id !== comment.id);

      await this.dataSource.getRepository(User).save(user);

      this.commentCRUDService.commentDelete(comment, user);

      return comment.id as string;
    } catch (error) {
      logger.error(error);
      throw new CustomError('Comment Delete Failed', HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  };

  // User Report
  userReportRead = async (
    body: UserReportReadRequest,
    client: User | Influencer,
    user: User,
  ): Promise<Partial<UserReport> | undefined> => {
    // Find the user report inside the client
    const userReport = (client?.userReports as UserReport[]).find(
      (clientUserReport) => (clientUserReport.reportedUser as User)?.id === user?.id,
    );
    if (!userReport) {
      return undefined;
    }
    const { id, report, isReportControlled, admin, updatedAt } = userReport as UserReport;

    return { id, report, isReportControlled, admin, updatedAt };
  };

  createUserReport = async (
    body: UserReportCreateRequest,
    oldClient: User | Influencer,
    oldUser: User,
  ): Promise<string> => {
    const user = clone(oldUser);
    const client = clone(oldClient);
    if (body.isReport) {
      // Create or update UserReport
      const existingUserReport = (client?.userReports as UserReport[]).find(
        (clientsUserReport) => (clientsUserReport.reportedUser as User)?.id === user?.id,
      );
      if (existingUserReport) {
        // Update existing UserReport
        if (existingUserReport.report === body.reason) {
          throw new CustomError(
            'User Report Cannot Be The Same With The Existing One',
            HttpStatus.BAD_REQUEST,
          );
        }

        existingUserReport.report = body.reason;
        const updatedReport = await this.dataSource
          .getRepository(UserReport)
          .save(existingUserReport);
        return updatedReport.id as string;
      }
      // Create new UserReport
      const userReport = new UserReport();
      if (body.isReporterUser) {
        userReport.reporterUser = client as User;
      } else {
        userReport.reporterInfluencer = client as Influencer;
      }

      userReport.reportedUser = user;
      userReport.report = body.reason;
      const createdUserReport = await this.dataSource.getRepository(UserReport).save(userReport);

      user.userReports = [...(user.commentReports || []), userReport];
      await this.dataSource.getRepository(User).save(user);

      client.userReports = [...(user.userReports || []), userReport];
      if (body.isReporterUser) {
        await this.dataSource.getRepository(User).save(client);
      } else {
        await this.dataSource.getRepository(Influencer).save(client);
      }

      return createdUserReport.id as string;
    }
    // Delete UserReport
    const existingUserReport = (client?.userReports as UserReport[]).find(
      (clientsUserReport) => (clientsUserReport.reportedUser as User).id === user.id,
    );

    if (!existingUserReport) {
      throw new CustomError('User Previously Not Reported', HttpStatus.BAD_REQUEST);
    }

    user.userReports = (user.userReports || []).filter(
      (userReport) => userReport.id !== existingUserReport.id,
    );
    await this.dataSource.getRepository(User).save(user);

    client.userReports = (client.userReports || []).filter(
      (userReport) => userReport.id !== existingUserReport.id,
    );
    if (body.isReporterUser) {
      await this.dataSource.getRepository(User).save(client);
    } else {
      await this.dataSource.getRepository(Influencer).save(client);
    }

    const deletedUserReport = await this.dataSource
      .getRepository(UserReport)
      .remove(existingUserReport);
    return deletedUserReport.id as string;
  };

  // Influencer Report
  createInfluencerReport = async (
    body: InfluencerReportCreateRequest,
    oldClient: User | Influencer,
    oldInfluencer: Influencer,
  ): Promise<string> => {
    const influencer = clone(oldInfluencer);
    const client = clone(oldClient);
    if (body.isReport) {
      // Create or update InfluencerReport
      const existingInfluencerReport = (client?.influencerReports as InfluencerReport[]).find(
        (clientsInfluencerReport) =>
          (clientsInfluencerReport.reportedInfluencer as Influencer)?.id === influencer?.id,
      );
      if (existingInfluencerReport) {
        // Update existing InfluencerReport
        if (existingInfluencerReport.report === body.reason) {
          throw new CustomError(
            'Influencer Report Cannot Be The Same With The Existing One',
            HttpStatus.BAD_REQUEST,
          );
        }

        existingInfluencerReport.report = body.reason;
        const updatedReport = await this.dataSource
          .getRepository(InfluencerReport)
          .save(existingInfluencerReport);
        return updatedReport.id as string;
      }
      // Create new InfluencerReport
      const influencerReport = new InfluencerReport();
      if (body.isReporterUser) {
        influencerReport.reporterInfluencer = client as User;
      } else {
        influencerReport.reporterInfluencer = client as Influencer;
      }

      influencerReport.reportedInfluencer = influencer;
      influencerReport.report = body.reason;
      const createdInfluencerReport = await this.dataSource
        .getRepository(InfluencerReport)
        .save(influencerReport);

      influencer.influencerReports = [...(influencer.commentReports || []), influencerReport];
      await this.dataSource.getRepository(Influencer).save(influencer);

      client.influencerReports = [...(influencer.influencerReports || []), influencerReport];
      if (body.isReporterUser) {
        await this.dataSource.getRepository(Influencer).save(client);
      } else {
        await this.dataSource.getRepository(Influencer).save(client);
      }

      return createdInfluencerReport.id as string;
    }
    // Delete InfluencerReport
    const existingInfluencerReport = (client?.influencerReports as InfluencerReport[]).find(
      (clientsInfluencerReport) =>
        (clientsInfluencerReport.reportedInfluencer as Influencer).id === influencer.id,
    );

    if (!existingInfluencerReport) {
      throw new CustomError('Influencer Previously Not Reported', HttpStatus.BAD_REQUEST);
    }

    influencer.influencerReports = (influencer.influencerReports || []).filter(
      (influencerReport) => influencerReport.id !== existingInfluencerReport.id,
    );
    await this.dataSource.getRepository(Influencer).save(influencer);

    client.influencerReports = (client.influencerReports || []).filter(
      (influencerReport) => influencerReport.id !== existingInfluencerReport.id,
    );
    if (body.isReporterUser) {
      await this.dataSource.getRepository(User).save(client);
    } else {
      await this.dataSource.getRepository(Influencer).save(client);
    }

    const deletedInfluencerReport = await this.dataSource
      .getRepository(InfluencerReport)
      .remove(existingInfluencerReport);
    return deletedInfluencerReport.id as string;
  };
}
