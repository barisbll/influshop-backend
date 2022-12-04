import { hash } from 'bcryptjs';
import { Container, Inject, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { SignupRequest } from '../api/rest/v1/controllers/Auth/Auth.type';
import Category from '../db/entities/influencerRelated/Category';
import Influencer from '../db/entities/influencerRelated/Influencer';
import InfluencerAddress from '../db/entities/influencerRelated/InfluencerAddress';
import { ItemService } from './Item.service';
import ItemGroup from '../db/entities/itemRelated/ItemGroup';

@Service()
export class InfluencerService {
  @Inject('dataSource')
  private dataSource: DataSource;
  private itemService: ItemService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.itemService = Container.get(ItemService);
  }

  createInfluencer = async (req: SignupRequest): Promise<string> => {
    const influencer = new Influencer();
    influencer.password = await hash(req.password, 12);
    influencer.username = req.username;
    influencer.email = req.email;
    influencer.itemGroups = [];
    await this.dataSource.manager.save(influencer);

    const category = new Category();
    category.name = 'default';
    category.influencer = influencer;
    await this.dataSource.manager.save(category);

    (influencer.categories as Category[]) = [category];
    const savedInfluencer = await this.dataSource.manager.save(influencer);
    return savedInfluencer.username as string;
  };

  deleteInfluencer = async (
    influencer: Influencer,
  ): Promise<void> => {
    influencer?.items?.forEach(async (item) => {
      if (item.extraFeatures) {
        await this.itemService.deleteItemWithExtra(influencer, item);
        await this.itemService.deleteItemGroup(influencer, (item.itemGroup as ItemGroup));
      } else {
        await this.itemService.deleteItem(influencer, item);
      }
    });

    influencer?.categories?.forEach(async (category) => {
      await this.dataSource
        .getRepository(Category)
        .createQueryBuilder()
        .from(Category, 'category')
        .where('category.id = :id', { id: category.id })
        .execute();
    });

    influencer?.addresses?.forEach(async (address) => {
      await this.dataSource
        .getRepository(InfluencerAddress)
        .createQueryBuilder()
        .softDelete()
        .from(InfluencerAddress)
        .where('id = :id', { id: address.id })
        .execute();
    });

    await this.dataSource
      .getRepository(Influencer)
      .createQueryBuilder()
      .softDelete()
      .from(Influencer)
      .where('id = :id', { id: influencer.id })
      .execute();
  };
}
