import clone from 'clone';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import HttpStatus from 'http-status-codes';
import {
  ItemReportCreateRequest,
  ItemReportReadRequest,
  ItemReportInspectRequest,
} from '../../api/rest/v1/controllers/Report/Report.type';
import User from '../../db/entities/userRelated/User';
import Item from '../../db/entities/itemRelated/Item';
import Influencer from '../../db/entities/influencerRelated/Influencer';
import ItemReport from '../../db/entities/itemRelated/ItemReport';
import { CustomError } from '../../util/CustomError';
import Admin from '../../db/entities/adminRelated/Admin';
import logger from '../../config/logger';
import { ItemService } from '../Item.service';

@Service()
export class ReportCRUDService {
  private dataSource: DataSource;
  private itemService: ItemService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.itemService = Container.get(ItemService);
  }

  itemReportRead = async (
    body: ItemReportReadRequest,
    client: User | Influencer,
    item: Item,
  ): Promise<Partial<ItemReport> | undefined> => {
    // Find the item report inside the client
    const itemReport = (client?.itemReports as ItemReport[]).find(
      (clientItemReport) => (clientItemReport.item as Item).id === item.id,
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
        (clientsItemReport) => (clientsItemReport.item as Item).id === item.id,
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
}
