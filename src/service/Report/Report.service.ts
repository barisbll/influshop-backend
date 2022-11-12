import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { RefreshTokenRequest } from '../../api/rest/v1/controllers/Auth/Auth.type';
import {
  ItemReportCreateRequest,
  ItemReportReadRequest,
} from '../../api/rest/v1/controllers/Report/Report.type';
import { CustomError } from '../../util/CustomError';
import User from '../../db/entities/userRelated/User';
import Item from '../../db/entities/itemRelated/Item';
import { ReportCRUDService } from './Report.CRUD.service';
import Influencer from '../../db/entities/influencerRelated/Influencer';
import ItemReport from '../../db/entities/itemRelated/ItemReport';

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
}
