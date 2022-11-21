import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { RefreshTokenRequest } from '../../api/rest/v1/controllers/Auth/Auth.type';
import {
  ItemReportCreateRequest,
  ItemReportReadRequest,
  ItemReportAdminReadRequest,
  ItemReportInspectRequest,
  CommentReportCreateRequest,
  CommentReportReadRequest,
  CommentReportAdminReadRequest,
  CommentReportInspectRequest,
  UserReportCreateRequest,
  UserReportReadRequest,
  UserReportAdminReadRequest,
  InfluencerReportCreateRequest,
} from '../../api/rest/v1/controllers/Report/Report.type';
import { CustomError } from '../../util/CustomError';
import User from '../../db/entities/userRelated/User';
import Item from '../../db/entities/itemRelated/Item';
import { ReportCRUDService } from './Report.CRUD.service';
import Influencer from '../../db/entities/influencerRelated/Influencer';
import ItemReport from '../../db/entities/itemRelated/ItemReport';
import Admin from '../../db/entities/adminRelated/Admin';
import { config } from '../../config/config';
import Comment from '../../db/entities/itemRelated/Comment';
import CommentReport from '../../db/entities/itemRelated/CommentReport';
import UserReport from '../../db/entities/userRelated/UserReport';
import logger from '../../config/logger';

@Service()
export class ReportService {
  private dataSource: DataSource;
  private reportCRUDService: ReportCRUDService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.reportCRUDService = Container.get(ReportCRUDService);
  }

  // Item Report
  itemReportRead = async (
    body: ItemReportReadRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<Partial<ItemReport> | undefined> => {
    const item = await this.dataSource.getRepository(Item).findOne({
      where: { id: body.itemId },
    });
    if (!item) {
      throw new CustomError('Item Not Found', HttpStatus.NOT_FOUND);
    }

    let client: User | Influencer;
    if (body.isReaderUser) {
      client = (await this.dataSource.getRepository(User).findOne({
        where: { id: decodedToken.id },
        relations: {
          itemReports: {
            item: true,
            admin: true,
          },
        },
      })) as User;
      if (!client) {
        throw new CustomError('User Not Found', HttpStatus.NOT_FOUND);
      }
    } else {
      client = (await this.dataSource.getRepository(Influencer).findOne({
        where: { id: decodedToken.id },
        relations: {
          itemReports: {
            item: true,
            admin: true,
          },
        },
      })) as Influencer;
      if (!client) {
        throw new CustomError('Influencer Not Found', HttpStatus.NOT_FOUND);
      }
    }

    const itemReport = await this.reportCRUDService.itemReportRead(body, client, item);
    return itemReport;
  };

  itemReportsRead = async (
    body: { pageId: number },
    decodedToken: RefreshTokenRequest,
  ): Promise<ItemReport[]> => {
    const admin = await this.dataSource.getRepository(Admin).findOne({
      where: { id: decodedToken.id },
    });

    if (!admin) {
      throw new CustomError('Admin Not Found', HttpStatus.NOT_FOUND);
    }

    const itemReports = await this.dataSource
      .getRepository(ItemReport)
      .createQueryBuilder('item_report')
      .select('item_report.id')
      .distinctOn(['item_report.item_id'])
      .leftJoinAndSelect('item_report.item', 'item')
      .leftJoinAndSelect('item.images', 'item_images')
      .offset(config.adminPaginationLimit * (body.pageId - 1))
      .limit(config.adminPaginationLimit)
      .getMany();

    return itemReports;
  };

  itemReportAdminRead = async (
    body: ItemReportAdminReadRequest,
    decodedToken: RefreshTokenRequest,
  ) => {
    const admin = await this.dataSource.getRepository(Admin).findOne({
      where: { id: decodedToken.id },
    });

    if (!admin) {
      throw new CustomError('Admin Not Found', HttpStatus.NOT_FOUND);
    }
    let itemReports;
    if (body.isControlled === undefined) {
      if (body.isApproved !== null) {
        itemReports = await this.dataSource
          .getRepository(ItemReport)
          .createQueryBuilder('item_report')
          .select([
            'item_report.id',
            'item_report.report',
            'item_report.isReportControlled',
            'item_report.isApproved',
            'item_report.createdAt',
            'item_report.updatedAt',
          ])
          .where('item_report.item_id = :itemId', { itemId: body.itemId })
          .leftJoinAndSelect('item_report.item', 'item')
          .leftJoinAndSelect('item.images', 'item_images')
          .leftJoinAndSelect('item_report.reporterUser', 'reporter_user')
          .leftJoinAndSelect('item_report.reporterInfluencer', 'reporter_influencer')
          .leftJoinAndSelect('item_report.admin', 'admin')
          .andWhere('item_report.isApproved = :isApproved', {
            isApproved: body.isApproved,
          })
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
      } else if (body.isApproved === null) {
        itemReports = await this.dataSource
          .getRepository(ItemReport)
          .createQueryBuilder('item_report')
          .select([
            'item_report.id',
            'item_report.report',
            'item_report.isReportControlled',
            'item_report.isApproved',
            'item_report.createdAt',
            'item_report.updatedAt',
          ])
          .where('item_report.item_id = :itemId', { itemId: body.itemId })
          .leftJoinAndSelect('item_report.item', 'item')
          .leftJoinAndSelect('item.images', 'item_images')
          .leftJoinAndSelect('item_report.reporterUser', 'reporter_user')
          .leftJoinAndSelect('item_report.reporterInfluencer', 'reporter_influencer')
          .leftJoinAndSelect('item_report.admin', 'admin')
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (body.isApproved !== null) {
        itemReports = await this.dataSource
          .getRepository(ItemReport)
          .createQueryBuilder('item_report')
          .select([
            'item_report.id',
            'item_report.report',
            'item_report.isReportControlled',
            'item_report.isApproved',
            'item_report.createdAt',
            'item_report.updatedAt',
          ])
          .where('item_report.item_id = :itemId', { itemId: body.itemId })
          .andWhere('item_report.isReportControlled = :isReportControlled', {
            isReportControlled: body.isControlled,
          })
          .andWhere('item_report.isApproved = :isApproved', {
            isApproved: body.isApproved,
          })
          .leftJoinAndSelect('item_report.item', 'item')
          .leftJoinAndSelect('item.images', 'item_images')
          .leftJoinAndSelect('item_report.reporterUser', 'reporter_user')
          .leftJoinAndSelect('item_report.reporterInfluencer', 'reporter_influencer')
          .leftJoinAndSelect('item_report.admin', 'admin')
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
      } else if (body.isApproved === null) {
        itemReports = await this.dataSource
          .getRepository(ItemReport)
          .createQueryBuilder('item_report')
          .select([
            'item_report.id',
            'item_report.report',
            'item_report.isReportControlled',
            'item_report.isApproved',
            'item_report.createdAt',
            'item_report.updatedAt',
          ])
          .where('item_report.item_id = :itemId', { itemId: body.itemId })
          .leftJoinAndSelect('item_report.item', 'item')
          .leftJoinAndSelect('item.images', 'item_images')
          .leftJoinAndSelect('item_report.reporterUser', 'reporter_user')
          .leftJoinAndSelect('item_report.reporterInfluencer', 'reporter_influencer')
          .leftJoinAndSelect('item_report.admin', 'admin')
          .andWhere('item_report.isReportControlled = :isReportControlled', {
            isReportControlled: body.isControlled,
          })
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
      }
    }

    return itemReports;
  };

  itemReportCreate = async (
    body: ItemReportCreateRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<string> => {
    // Find the user who is reporting the item
    let client: User | Influencer;
    if (body.isReporterUser) {
      client = (await this.dataSource.getRepository(User).findOne({
        where: { id: decodedToken.id },
        relations: {
          itemReports: {
            item: true,
          },
        },
      })) as User;

      if (!client) {
        throw new CustomError('User Not Found', HttpStatus.NOT_FOUND);
      }
    } else {
      client = (await this.dataSource.getRepository(Influencer).findOne({
        where: { id: decodedToken.id },
        relations: {
          itemReports: {
            item: true,
          },
        },
      })) as Influencer;
      if (!client) {
        throw new CustomError('Influencer Not Found', HttpStatus.NOT_FOUND);
      }
    }
    const item = await this.dataSource.getRepository(Item).findOne({
      where: { id: body.itemId },
      relations: {
        itemReports: true,
      },
    });
    if (!item) {
      throw new CustomError('Item Not Found', HttpStatus.NOT_FOUND);
    }

    const reportId = await this.reportCRUDService.createItemReport(body, client, item);
    return reportId;
  };

  itemReportInspect = async (
    body: ItemReportInspectRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<string> => {
    const admin = await this.dataSource.getRepository(Admin).findOne({
      where: { id: decodedToken.id },
    });

    if (!admin) {
      throw new CustomError('Admin Not Found', HttpStatus.NOT_FOUND);
    }

    const item = await this.dataSource.getRepository(Item).findOne({
      where: { id: body.itemId },
      relations: {
        itemReports: true,
        influencer: true,
      },
    });

    if (!item) {
      throw new CustomError('Item Report Not Found', HttpStatus.NOT_FOUND);
    }

    const reportId = await this.reportCRUDService.itemReportInspect(body, item, admin);
    return reportId;
  };

  // Comment Report
  commentReportRead = async (
    body: CommentReportReadRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<Partial<CommentReport> | undefined> => {
    const comment = await this.dataSource.getRepository(Comment).findOne({
      where: { id: body.commentId },
    });
    if (!comment) {
      throw new CustomError('Comment Not Found', HttpStatus.NOT_FOUND);
    }

    let client: User | Influencer;
    if (body.isReaderUser) {
      client = (await this.dataSource.getRepository(User).findOne({
        where: { id: decodedToken.id },
        relations: {
          commentReports: {
            reportedComment: true,
            admin: true,
          },
        },
      })) as User;
      if (!client) {
        throw new CustomError('User Not Found', HttpStatus.NOT_FOUND);
      }
    } else {
      client = (await this.dataSource.getRepository(Influencer).findOne({
        where: { id: decodedToken.id },
      })) as Influencer;
      if (!client) {
        throw new CustomError('Influencer Not Found', HttpStatus.NOT_FOUND);
      }
    }

    const commentReport = await this.reportCRUDService.commentReportRead(body, client, comment);
    return commentReport;
  };

  commentReportsRead = async (
    body: { pageId: number },
    decodedToken: RefreshTokenRequest,
  ): Promise<CommentReport[]> => {
    const admin = await this.dataSource.getRepository(Admin).findOne({
      where: { id: decodedToken.id },
    });

    if (!admin) {
      throw new CustomError('Admin Not Found', HttpStatus.NOT_FOUND);
    }

    const commentReports = await this.dataSource
      .getRepository(CommentReport)
      .createQueryBuilder('comment_report')
      .select('comment_report.id')
      .distinctOn(['comment_report.reported_comment_id'])
      .leftJoinAndSelect('comment_report.reportedComment', 'comment')
      .leftJoinAndSelect('comment.commentImages', 'comment_images')
      .offset(config.adminPaginationLimit * (body.pageId - 1))
      .limit(config.adminPaginationLimit)
      .getMany();

    return commentReports;
  };

  commentReportAdminRead = async (
    body: CommentReportAdminReadRequest,
    decodedToken: RefreshTokenRequest,
  ) => {
    const admin = await this.dataSource.getRepository(Admin).findOne({
      where: { id: decodedToken.id },
    });

    if (!admin) {
      throw new CustomError('Admin Not Found', HttpStatus.NOT_FOUND);
    }
    let commentReports;
    if (body.isControlled === undefined) {
      if (body.isApproved !== null) {
        commentReports = await this.dataSource
          .getRepository(CommentReport)
          .createQueryBuilder('comment_report')
          .where('comment_report.reported_comment_id = :commentId', { commentId: body.commentId })
          .leftJoinAndSelect('comment_report.reportedComment', 'comment')
          .leftJoinAndSelect('comment.commentImages', 'comment_images')
          .leftJoinAndSelect('comment_report.reporterUser', 'reporter_user')
          .leftJoinAndSelect('comment_report.reporterInfluencer', 'reporter_influencer')
          .leftJoinAndSelect('comment_report.admin', 'admin')
          .andWhere('comment_report.isApproved = :isApproved', {
            isApproved: body.isApproved,
          })
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
      } else if (body.isApproved === null) {
        commentReports = await this.dataSource
          .getRepository(CommentReport)
          .createQueryBuilder('comment_report')
          .where('comment_report.reported_comment_id = :commentId', { commentId: body.commentId })
          .leftJoinAndSelect('comment_report.reportedComment', 'comment')
          .leftJoinAndSelect('comment.commentImages', 'comment_images')
          .leftJoinAndSelect('comment_report.reporterUser', 'reporter_user')
          .leftJoinAndSelect('comment_report.reporterInfluencer', 'reporter_influencer')
          .leftJoinAndSelect('comment_report.admin', 'admin')
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (body.isApproved !== null) {
        commentReports = await this.dataSource
          .getRepository(CommentReport)
          .createQueryBuilder('comment_report')
          .where('comment_report.reported_comment_id = :commentId', { commentId: body.commentId })
          .andWhere('comment_report.isReportControlled = :isReportControlled', {
            isReportControlled: body.isControlled,
          })
          .andWhere('comment_report.isApproved = :isApproved', {
            isApproved: body.isApproved,
          })
          .leftJoinAndSelect('comment_report.reportedComment', 'comment')
          .leftJoinAndSelect('comment.commentImages', 'comment_images')
          .leftJoinAndSelect('comment_report.reporterUser', 'reporter_user')
          .leftJoinAndSelect('comment_report.reporterInfluencer', 'reporter_influencer')
          .leftJoinAndSelect('comment_report.admin', 'admin')
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
      } else if (body.isApproved === null) {
        commentReports = await this.dataSource
          .getRepository(CommentReport)
          .createQueryBuilder('comment_report')
          .where('comment_report.reported_comment_id = :commentId', { commentId: body.commentId })
          .leftJoinAndSelect('comment_report.reportedComment', 'comment')
          .leftJoinAndSelect('comment.commentImages', 'comment_images')
          .leftJoinAndSelect('comment_report.reporterUser', 'reporter_user')
          .leftJoinAndSelect('comment_report.reporterInfluencer', 'reporter_influencer')
          .leftJoinAndSelect('comment_report.admin', 'admin')
          .andWhere('comment_report.isReportControlled = :isReportControlled', {
            isReportControlled: body.isControlled,
          })
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
      }
    }

    return commentReports;
  };

  commentReportCreate = async (
    body: CommentReportCreateRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<string> => {
    // Find the user who is reporting the comment
    let client: User | Influencer;
    if (body.isReporterUser) {
      client = (await this.dataSource.getRepository(User).findOne({
        where: { id: decodedToken.id },
        relations: {
          commentReports: {
            reportedComment: true,
          },
        },
      })) as User;

      if (!client) {
        throw new CustomError('User Not Found', HttpStatus.NOT_FOUND);
      }
    } else {
      client = (await this.dataSource.getRepository(Influencer).findOne({
        where: { id: decodedToken.id },
        relations: {
          commentReports: {
            reportedComment: true,
          },
        },
      })) as Influencer;
      if (!client) {
        throw new CustomError('Influencer Not Found', HttpStatus.NOT_FOUND);
      }
    }

    const comment = await this.dataSource.getRepository(Comment).findOne({
      where: { id: body.commentId },
      relations: {
        commentReports: true,
      },
    });
    if (!comment) {
      throw new CustomError('Comment Not Found', HttpStatus.NOT_FOUND);
    }

    const reportId = await this.reportCRUDService.createCommentReport(body, client, comment);
    return reportId;
  };

  commentReportInspect = async (
    body: CommentReportInspectRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<string> => {
    const admin = await this.dataSource.getRepository(Admin).findOne({
      where: { id: decodedToken.id },
    });

    if (!admin) {
      throw new CustomError('Admin Not Found', HttpStatus.NOT_FOUND);
    }

    const comment = await this.dataSource.getRepository(Comment).findOne({
      where: {
        id: body.commentId,
      },
      relations: {
        commentImages: true,
        commentLikes: true,
        commentReports: true,
        user: true,
        item: true,
      },
    });

    if (!comment) {
      throw new CustomError('Comment Not Found', HttpStatus.NOT_FOUND);
    }

    const reportId = await this.reportCRUDService.commentReportInspect(body, comment, admin);
    return reportId;
  };

  // User Report
  userReportRead = async (
    body: UserReportReadRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<Partial<UserReport> | undefined> => {
    const user = await this.dataSource.getRepository(User).findOne({
      where: { id: body.userId },
    });
    if (!user) {
      throw new CustomError('User Not Found', HttpStatus.NOT_FOUND);
    }

    let client: User | Influencer;
    if (body.isReaderUser) {
      client = (await this.dataSource.getRepository(User).findOne({
        where: { id: decodedToken.id },
        relations: {
          userReports: {
            reportedUser: true,
            admin: true,
          },
        },
      })) as User;
      if (!client) {
        throw new CustomError('User Not Found', HttpStatus.NOT_FOUND);
      }
    } else {
      client = (await this.dataSource.getRepository(Influencer).findOne({
        where: { id: decodedToken.id },
      })) as Influencer;
      if (!client) {
        throw new CustomError('Influencer Not Found', HttpStatus.NOT_FOUND);
      }
    }

    const userReport = await this.reportCRUDService.userReportRead(body, client, user);
    return userReport;
  };

  userReportsRead = async (
    body: { pageId: number },
    decodedToken: RefreshTokenRequest,
  ): Promise<UserReport[]> => {
    const admin = await this.dataSource.getRepository(Admin).findOne({
      where: { id: decodedToken.id },
    });

    if (!admin) {
      throw new CustomError('Admin Not Found', HttpStatus.NOT_FOUND);
    }

    const userReports = await this.dataSource
      .getRepository(UserReport)
      .createQueryBuilder('user_report')
      .select('user_report.id')
      .distinctOn(['user_report.reported_user_id'])
      .leftJoinAndSelect('user_report.reportedUser', 'user')
      .offset(config.adminPaginationLimit * (body.pageId - 1))
      .limit(config.adminPaginationLimit)
      .getMany();

    return userReports;
  };

  userReportAdminRead = async (
    body: UserReportAdminReadRequest,
    decodedToken: RefreshTokenRequest,
  ) => {
    const admin = await this.dataSource.getRepository(Admin).findOne({
      where: { id: decodedToken.id },
    });

    if (!admin) {
      throw new CustomError('Admin Not Found', HttpStatus.NOT_FOUND);
    }
    let userReports;
    if (body.isControlled === undefined) {
      if (body.isApproved !== null) {
        userReports = await this.dataSource
          .getRepository(UserReport)
          .createQueryBuilder('user_report')
          .where('user_report.reported_user_id = :userId', { userId: body.userId })
          .leftJoinAndSelect('user_report.reportedUser', 'user')
          .leftJoinAndSelect('user_report.reporterUser', 'reporter_user')
          .leftJoinAndSelect('user_report.reporterInfluencer', 'reporter_influencer')
          .leftJoinAndSelect('user_report.admin', 'admin')
          .andWhere('user_report.isApproved = :isApproved', {
            isApproved: body.isApproved,
          })
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
      } else if (body.isApproved === null) {
        userReports = await this.dataSource
          .getRepository(UserReport)
          .createQueryBuilder('user_report')
          .where('user_report.reported_user_id = :userId', { userId: body.userId })
          .leftJoinAndSelect('user_report.reportedUser', 'user')
          .leftJoinAndSelect('user_report.reporterUser', 'reporter_user')
          .leftJoinAndSelect('user_report.reporterInfluencer', 'reporter_influencer')
          .leftJoinAndSelect('user_report.admin', 'admin')
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (body.isApproved !== null) {
        userReports = await this.dataSource
          .getRepository(UserReport)
          .createQueryBuilder('user_report')
          .where('user_report.reported_user_id = :userId', { userId: body.userId })
          .andWhere('user_report.isReportControlled = :isReportControlled', {
            isReportControlled: body.isControlled,
          })
          .andWhere('user_report.isApproved = :isApproved', {
            isApproved: body.isApproved,
          })
          .leftJoinAndSelect('user_report.reportedUser', 'user')
          .leftJoinAndSelect('user_report.reporterUser', 'reporter_user')
          .leftJoinAndSelect('user_report.reporterInfluencer', 'reporter_influencer')
          .leftJoinAndSelect('user_report.admin', 'admin')
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
      } else if (body.isApproved === null) {
        userReports = await this.dataSource
          .getRepository(UserReport)
          .createQueryBuilder('user_report')
          .where('user_report.reported_user_id = :userId', { userId: body.userId })
          .leftJoinAndSelect('user_report.reportedUser', 'user')
          .leftJoinAndSelect('user_report.reporterUser', 'reporter_user')
          .leftJoinAndSelect('user_report.reporterInfluencer', 'reporter_influencer')
          .leftJoinAndSelect('user_report.admin', 'admin')
          .andWhere('user_report.isReportControlled = :isReportControlled', {
            isReportControlled: body.isControlled,
          })
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
      }
    }

    return userReports;
  };

  userReportCreate = async (
    body: UserReportCreateRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<string> => {
    // Find the user who is reporting the comment
    let client: User | Influencer;
    if (body.isReporterUser) {
      client = (await this.dataSource.getRepository(User).findOne({
        where: { id: decodedToken.id },
        relations: {
          userReports: {
            reportedUser: true,
          },
        },
      })) as User;

      if (!client) {
        throw new CustomError('User Not Found', HttpStatus.NOT_FOUND);
      }
    } else {
      client = (await this.dataSource.getRepository(Influencer).findOne({
        where: { id: decodedToken.id },
        relations: {
          userReports: {
            reportedUser: true,
          },
        },
      })) as Influencer;
      if (!client) {
        throw new CustomError('Influencer Not Found', HttpStatus.NOT_FOUND);
      }
    }

    const userToReport = await this.dataSource.getRepository(User).findOne({
      where: { id: body.userId },
      relations: {
        userReports: true,
      },
    });
    if (!userToReport) {
      throw new CustomError('Comment Not Found', HttpStatus.NOT_FOUND);
    }

    const reportId = await this.reportCRUDService.createUserReport(body, client, userToReport);
    return reportId;
  };

  // Influencer Report
  influencerReportCreate = async (
    body: InfluencerReportCreateRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<string> => {
    // Find the user who is reporting the comment
    let client: User | Influencer;
    if (body.isReporterUser) {
      client = (await this.dataSource.getRepository(User).findOne({
        where: { id: decodedToken.id },
        relations: {
          influencerReports: {
            reportedInfluencer: true,
          },
        },
      })) as User;

      if (!client) {
        throw new CustomError('User Not Found', HttpStatus.NOT_FOUND);
      }
    } else {
      client = (await this.dataSource.getRepository(Influencer).findOne({
        where: { id: decodedToken.id },
        relations: {
          influencerReports: {
            reportedInfluencer: true,
          },
        },
      })) as Influencer;
      if (!client) {
        throw new CustomError('Influencer Not Found', HttpStatus.NOT_FOUND);
      }
    }

    const influencerToReport = await this.dataSource.getRepository(Influencer).findOne({
      where: { id: body.influencerId },
      relations: {
        influencerReports: true,
      },
    });
    if (!influencerToReport) {
      throw new CustomError('Comment Not Found', HttpStatus.NOT_FOUND);
    }

    const reportId = await this.reportCRUDService.createInfluencerReport(
      body,
      client,
      influencerToReport,
    );
    return reportId;
  };
}
