import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { RefreshTokenRequest } from '../../api/rest/v1/controllers/Auth/Auth.type';
import {
  ItemReportCreateRequest,
  ItemReportReadRequest,
  ItemReportAdminReadRequest,
  ItemReportInspectRequest,
} from '../../api/rest/v1/controllers/Report/Report.type';
import { CustomError } from '../../util/CustomError';
import User from '../../db/entities/userRelated/User';
import Item from '../../db/entities/itemRelated/Item';
import { ReportCRUDService } from './Report.CRUD.service';
import Influencer from '../../db/entities/influencerRelated/Influencer';
import ItemReport from '../../db/entities/itemRelated/ItemReport';
import Admin from '../../db/entities/adminRelated/Admin';
import { config } from '../../config/config';

@Service()
export class ReportService {
  private dataSource: DataSource;
  private reportCRUDService: ReportCRUDService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.reportCRUDService = Container.get(ReportCRUDService);
  }

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
      })) as Influencer;
      if (!client) {
        throw new CustomError('Influencer Not Found', HttpStatus.NOT_FOUND);
      }
    }

    const itemReport = await this.reportCRUDService.itemReportRead(body, client, item);
    return itemReport;
  };

  // Add query parameters like searching with unapproved or uncontrolled
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

  // itemReportAdminRead = async (
  //   body: { itemId: string },
  //   decodedToken: RefreshTokenRequest,
  // ): Promise<ItemReport | null> => {
  //   const admin = await this.dataSource.getRepository(Admin).findOne({
  //     where: { id: decodedToken.id },
  //   });

  //   if (!admin) {
  //     throw new CustomError('Admin Not Found', HttpStatus.NOT_FOUND);
  //   }

  //   const item = await this.dataSource.getRepository(Item).findOne({
  //     where: { id: body.itemId },
  //     relations: {
  //       itemReports: {
  //         reporterUser: true,
  //         reporterInfluencer: true,
  //         admin: true,
  //       },
  //       images: true,
  //     },
  //   });

  //   return item;
  // };

  // version 2
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
          .where('item_report.isApproved = :isApproved', {
            isApproved: body.isApproved,
          })
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
      }
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
    } else {
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
          .where('item_report.isReportControlled = :isReportControlled', {
            isReportControlled: body.isControlled,
          })
          .where('item_report.isApproved = :isApproved', {
            isApproved: body.isApproved,
          })
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
      }
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
          .where('item_report.isReportControlled = :isReportControlled', {
            isReportControlled: body.isControlled,
          })
          .offset(config.adminPaginationLimit * (body.pageId - 1))
          .limit(config.adminPaginationLimit)
          .getMany();
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
}
