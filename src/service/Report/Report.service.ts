import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { RefreshTokenRequest } from '../../api/rest/v1/controllers/Auth/Auth.type';
import {
  ItemReportCreateRequest,
  ItemReportReadRequest,
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

  itemReportsRead = async (
    body: { pId: number },
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
      .leftJoinAndSelect('item_report.item', 'item')
      .leftJoinAndSelect('item_report.admin', 'admin')
      .leftJoinAndSelect('item_report.reporterUser', 'user.id')
      .leftJoinAndSelect('item_report.reporterInfluencer', 'influencer')
      .offset(config.adminPaginationLimit * (body.pId - 1))
      .limit(config.adminPaginationLimit)
      .getMany();

    return itemReports;
  };

  itemReportAdminRead = async (
    body: { itemId: string },
    decodedToken: RefreshTokenRequest,
  ): Promise<ItemReport | null> => {
    const admin = await this.dataSource.getRepository(Admin).findOne({
      where: { id: decodedToken.id },
    });

    if (!admin) {
      throw new CustomError('Admin Not Found', HttpStatus.NOT_FOUND);
    }

    const item = await this.dataSource.getRepository(Item).findOne({
      where: { id: body.itemId },
      relations: {
        itemReports: {
          reporterUser: true,
          reporterInfluencer: true,
        },
        images: true,
      },
    });

    return item;
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
