import clone from 'clone';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import HttpStatus from 'http-status-codes';
import {
  ItemReportCreateRequest,
  ItemReportReadRequest,
} from '../../api/rest/v1/controllers/Report/Report.type';
import User from '../../db/entities/userRelated/User';
import Item from '../../db/entities/itemRelated/Item';
import Influencer from '../../db/entities/influencerRelated/Influencer';
import ItemReport from '../../db/entities/itemRelated/ItemReport';
import { CustomError } from '../../util/CustomError';

@Service()
export class ReportCRUDService {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = Container.get('dataSource');
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
}
