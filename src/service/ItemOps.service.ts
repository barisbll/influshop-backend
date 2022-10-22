import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { RefreshTokenRequest } from '../api/rest/v1/controllers/Auth/Auth.type';
import {
    ItemCreateRequest, ItemGroupCreateRequest,
    ItemWithExtraCreateRequest,
} from '../api/rest/v1/controllers/ItemOps/ItemOps.type';
import Influencer from '../db/entities/influencerRelated/Influencer';
import ItemGroup from '../db/entities/itemRelated/ItemGroup';
import { CustomError } from '../util/CustomError';
import { ItemService } from './Item.service';

@Service()
export class ItemOpsService {
  private dataSource: DataSource;
  private itemService: ItemService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.itemService = Container.get(ItemService);
  }

  isInfluencer = async (id: string): Promise<Influencer | null> => {
    const influencer = await this.dataSource.getRepository(Influencer).findOne({
      where: { id },
      relations: {
        itemGroups: true,
        items: true,
        categories: true,
      },
    });
    if (influencer) {
      return influencer;
    }
    return null;
  };

  itemGroupeGet = async (decodedToken: RefreshTokenRequest): Promise<ItemGroup[] | undefined> => {
    const influencer = await this.isInfluencer(decodedToken.id);

    if (!influencer) {
      throw new CustomError(
        'The Account Is Not An Influencer or Does Not Exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return influencer.itemGroups?.map((itemGroup) => {
      const { itemGroupName, extraFeatures } = itemGroup;
      return { itemGroupName, extraFeatures };
    });
  };

  isItemGroupNameUniqueToInfluencer = async (
    itemGroupName: string,
    influencer: Influencer,
  ): Promise<boolean> =>
    influencer.itemGroups?.reduce(
      (acc, current) => acc && current.itemGroupName !== itemGroupName,
      true,
    ) as boolean;

  itemGroupCreate = async (
    body: ItemGroupCreateRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<void> => {
    const influencer = await this.isInfluencer(decodedToken.id);

    if (!influencer) {
      throw new CustomError(
        'The Account Is Not An Influencer or Does Not Exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!(await this.isItemGroupNameUniqueToInfluencer(body.itemGroupName, influencer))) {
      throw new CustomError(
        'The Item Group Name Is Not Unique To The Influencer',
        HttpStatus.CONFLICT,
      );
    }

    await this.itemService.createItemGroup(body, influencer);
  };

  itemCreateWithExtra = async (
    body: ItemWithExtraCreateRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<void> => {
    const influencer = await this.isInfluencer(decodedToken.id);

    if (!influencer) {
      throw new CustomError(
        'The Account Is Not An Influencer or Does Not Exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.itemService.createItemWithExtra(body, influencer);
  };

    itemCreate = async (
    body: ItemCreateRequest,
    decodedToken: RefreshTokenRequest,
    ): Promise<void> => {
    const influencer = await this.isInfluencer(decodedToken.id);

    if (!influencer) {
      throw new CustomError(
        'The Account Is Not An Influencer or Does Not Exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.itemService.createItem(body, influencer);
  };
}
