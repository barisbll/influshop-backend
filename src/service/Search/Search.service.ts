import { Service, Container } from 'typedi';
import { DataSource } from 'typeorm';
import { InfluencerSearchRequest } from '../../api/rest/v1/controllers/Search/Search.types';
import Influencer from '../../db/entities/influencerRelated/Influencer';
import Item from '../../db/entities/itemRelated/Item';
import { config } from '../../config/config';

@Service()
export class SearchService {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = Container.get('dataSource');
  }

  searchInfluencer = async (influencerSearchRequest: InfluencerSearchRequest) => {
      const influencers = await this.dataSource
      .getRepository(Influencer)
      .createQueryBuilder()
      .select(['influencer.username', 'influencer.imageLocation'])
      .from(Influencer, 'influencer')
      .where('influencer.username ILIKE :searchTerm', { searchTerm: `%${influencerSearchRequest.query}%` })
      .skip(config.searchPageItemLimit * (influencerSearchRequest.page - 1))
      .take(config.searchPageItemLimit)
      .getMany();

    return influencers;
  };

  searchItem = async (itemSearchRequest: InfluencerSearchRequest) => {
      const items = await this.dataSource
      .getRepository(Item)
      .createQueryBuilder()
      .select('item')
      .from(Item, 'item')
      .leftJoinAndSelect('item.itemGroup', 'itemGroup')
      .leftJoinAndSelect('item.images', 'itemImage')
      .where('item.itemName ILIKE :searchTerm', { searchTerm: `%${itemSearchRequest.query}%` })
      .skip(config.searchPageItemLimit * (itemSearchRequest.page - 1))
      .take(config.searchPageItemLimit)
      .getMany();

    return items;
  };
}
