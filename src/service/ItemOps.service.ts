import HttpStatus from 'http-status-codes';
import { isDeepStrictEqual } from 'node:util';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { RefreshTokenRequest } from '../api/rest/v1/controllers/Auth/Auth.type';
import {
  ItemCreateRequest,
  ItemGroupCreateRequest,
  ItemGroupUpdateRequest,
  ItemUpdateRequest,
  ItemWithExtraCreateRequest,
  ItemWithExtraUpdateRequest,
} from '../api/rest/v1/controllers/ItemOps/ItemOps.type';
import Influencer from '../db/entities/influencerRelated/Influencer';
import Item from '../db/entities/itemRelated/Item';
import ItemGroup from '../db/entities/itemRelated/ItemGroup';
import { CustomError } from '../util/CustomError';
import { ItemService } from './Item.service';
import { arrayEquals, itemsMapper } from './ItemOps.helper';
import { ItemGetResult, MappedObject } from './ItemOps.type';

@Service()
export class ItemOpsService {
  private dataSource: DataSource;
  private itemService: ItemService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.itemService = Container.get(ItemService);
  }

  isInfluencer = async (
    id: string,
    areItemGroup: boolean = true,
    areItem: boolean = true,
  ): Promise<Influencer | null> => {
    const influencer = await this.dataSource.getRepository(Influencer).findOne({
      where: { id },
      relations: {
        itemGroups: areItemGroup,
        items: areItem,
      },
    });
    if (influencer) {
      return influencer;
    }
    return null;
  };

  itemGroupsGet = async (decodedToken: RefreshTokenRequest): Promise<ItemGroup[] | undefined> => {
    const influencer = await this.isInfluencer(decodedToken.id, true, false);

    if (!influencer) {
      throw new CustomError(
        'The Account Is Not An Influencer or Does Not Exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return influencer.itemGroups?.map((itemGroup) => {
      const { itemGroupName, extraFeatures, id } = itemGroup;
      return { itemGroupName, extraFeatures, id };
    });
  };

  itemGroupGet = async (id: string): Promise<ItemGroup> => {
    const itemGroup = await this.dataSource.getRepository(ItemGroup).findOne({
      where: { id },
    });

    if (!itemGroup) {
      throw new CustomError('Item Group Does Not Exist', HttpStatus.NOT_FOUND);
    }

    const { itemGroupName, extraFeatures, imageLocation, isVisible } = itemGroup;

    return { itemGroupName, extraFeatures, imageLocation, isVisible };
  };

  itemsGet = async (influencerName: string): Promise<MappedObject[]> => {
    const influencer = await this.dataSource.getRepository(Influencer).findOne({
      where: { username: influencerName },
      relations: {
        items: {
          itemGroup: true,
          images: true,
          comments: true,
        },
        itemGroups: true,
        pinnedItem: true,
      },
    });

    if (!influencer) {
      throw new CustomError('The Influencer Does Not Exist', HttpStatus.NOT_FOUND);
    }

    return itemsMapper(influencer.items, influencer?.pinnedItem?.id);
  };

  itemGet = async (itemId: string): Promise<Omit<ItemGetResult, 'extraFeatures'>> => {
    const item = await this.dataSource.getRepository(Item).findOne({
      where: { id: itemId },
      relations: {
        comments: true,
        images: true,
      },
    });

    if (!item) {
      throw new CustomError('The Item Does Not Exist', HttpStatus.NOT_FOUND);
    }

    const { id, itemName, itemPrice, itemQuantity, averageStars, comments, images } = item;

    const mappedImages = images?.map((image) => {
      const { imageLocation, imageOrder } = image;
      return { imageLocation, imageOrder };
    });

    return {
      id: id as string,
      name: itemName as string,
      price: itemPrice as number,
      available: (itemQuantity || 1) > 0,
      averageStars,
      comments,
      images: mappedImages,
    };
  };

  itemGetWithExtraFeatures = async (
    influencerName: string,
    itemGroupName: string,
    queryParams: unknown,
  ): Promise<ItemGetResult> => {
    const influencer = await this.dataSource.getRepository(Influencer).findOne({
      where: {
        username: influencerName,
      },
      relations: {
        itemGroups: {
          items: {
            images: true,
            comments: true,
          },
        },
      },
    });

    if (!influencer) {
      throw new CustomError('The Influencer Does Not Exist', HttpStatus.NOT_FOUND);
    }

    const itemGroup = influencer?.itemGroups?.find(
      (group) => group.itemGroupName === itemGroupName,
    );

    if (!itemGroup) {
      throw new CustomError('The Item Group Does Not Exist', HttpStatus.NOT_FOUND);
    }

    const result = itemGroup.items?.find((item) =>
      isDeepStrictEqual(item.extraFeatures, queryParams));

    if (!result) {
      throw new CustomError('The Item With Given Params Does Not Exist', HttpStatus.NOT_FOUND);
    }

    const { id, itemName, itemPrice, itemQuantity, averageStars, comments, images, extraFeatures } =
      result;

    const mappedImages = images?.map((image) => {
      const { imageLocation, imageOrder } = image;
      return { imageLocation, imageOrder };
    });

    return {
      id: id as string,
      name: itemName as string,
      price: itemPrice as number,
      available: (itemQuantity || 1) > 0,
      averageStars,
      comments,
      images: mappedImages,
      extraFeatures,
    };
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
    const influencer = await this.isInfluencer(decodedToken.id, true, false);

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
    const influencer = await this.isInfluencer(decodedToken.id, false, true);

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
    const influencer = await this.isInfluencer(decodedToken.id, false, true);

    if (!influencer) {
      throw new CustomError(
        'The Account Is Not An Influencer or Does Not Exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.itemService.createItem(body, influencer);
  };

  isItemGroupExist = async (itemGroupId: string): Promise<boolean> => {
    const itemGroup = await this.dataSource.getRepository(ItemGroup).findOne({
      where: { id: itemGroupId },
    });

    return !!itemGroup;
  };

  itemGroupUpdate = async (
    body: ItemGroupUpdateRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<void> => {
    const influencer = await this.isInfluencer(decodedToken.id, true, false);

    if (!influencer) {
      throw new CustomError(
        'The Account Is Not An Influencer or Does Not Exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const itemGroup = await this.dataSource.getRepository(ItemGroup).findOne({
      where: { id: body.itemGroupId },
      relations: {
        items: true,
      },
    });

    if (!itemGroup) {
      throw new CustomError('The Item Group Does Not Exist', HttpStatus.NOT_FOUND);
    }

    if (
      !(await this.isItemGroupNameUniqueToInfluencer(body.itemGroupName, influencer)) &&
      body.itemGroupName !== itemGroup.itemGroupName
    ) {
      throw new CustomError(
        'The Item Group Name Is Not Unique To The Influencer',
        HttpStatus.CONFLICT,
      );
    }

    if (
      !arrayEquals(body.extraFeatures, Object.keys(itemGroup.extraFeatures)) &&
      (itemGroup.items as [])?.length > 0
    ) {
      throw new CustomError(
        'The Item Group Has Items, It Cannot Change Extra Features',
        HttpStatus.CONFLICT,
      );
    }

    await this.itemService.updateItemGroup(body, itemGroup);
  };

  itemUpdateWithExtra = async (
    body: ItemWithExtraUpdateRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<void> => {
    const influencer = await this.isInfluencer(decodedToken.id, false, false);

    if (!influencer) {
      throw new CustomError(
        'The Account Is Not An Influencer or Does Not Exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const item = await this.dataSource.getRepository(Item).findOne({
      where: { id: body.itemId },
      relations: {
        itemGroup: {
          items: true,
        },
      },
    });

    if (!item) {
      throw new CustomError('The Item Does Not Exist', HttpStatus.NOT_FOUND);
    }

    await this.itemService.updateItemWithExtra(body, item);
  };

  itemUpdate = async (
    body: ItemUpdateRequest,
    decodedToken: RefreshTokenRequest,
  ): Promise<void> => {
    const influencer = await this.isInfluencer(decodedToken.id, false, false);

    if (!influencer) {
      throw new CustomError(
        'The Account Is Not An Influencer or Does Not Exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const item = await this.dataSource.getRepository(Item).findOne({
      where: { id: body.itemId },
    });

    if (!item) {
      throw new CustomError('The Item Does Not Exist', HttpStatus.NOT_FOUND);
    }

    await this.itemService.updateItem(body, item);
  };

  itemGroupDelete = async (
    itemGroupId: string,
    decodedToken: RefreshTokenRequest,
  ): Promise<void> => {
    const influencer = await this.isInfluencer(decodedToken.id, true, false);

    if (!influencer) {
      throw new CustomError(
        'The Account Is Not An Influencer or Does Not Exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const itemGroup = await this.dataSource.getRepository(ItemGroup).findOne({
      where: { id: itemGroupId },
      relations: {
        items: true,
      },
    });

    if (!itemGroup) {
      throw new CustomError('The Item Group Does Not Exist', HttpStatus.NOT_FOUND);
    }

    if ((itemGroup.items as [])?.length > 0) {
      throw new CustomError('The Item Group Has Items, It Cannot Be Deleted', HttpStatus.CONFLICT);
    }

    await this.itemService.deleteItemGroup(influencer, itemGroup);
  };

  itemDeleteWithExtra = async (
    itemId: string,
    decodedToken: RefreshTokenRequest,
  ): Promise<void> => {
    const influencer = await this.dataSource.getRepository(Influencer).findOne({
      where: { id: decodedToken.id },
      relations: {
        itemGroups: {
          items: true,
        },
        items: true,
        pinnedItem: true,
        categories: {
          items: true,
        },
      },
    });

    if (!influencer) {
      throw new CustomError(
        'The Account Is Not An Influencer or Does Not Exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const item = await this.dataSource.getRepository(Item).findOne({
      where: { id: itemId },
      relations: {
        itemGroup: {
          items: true,
        },
        images: true,
        comments: {
          commentLikes: true,
          commentImages: true,
          commentReports: true,
        },
        cartItems: {
          cart: true,
        },
        itemStars: true,
        itemReports: true,
      },
    });

    if (!item) {
      throw new CustomError('The Item Does Not Exist', HttpStatus.NOT_FOUND);
    }

    await this.itemService.deleteItemWithExtra(influencer, item);
  };

  itemDelete = async (itemId: string, decodedToken: RefreshTokenRequest): Promise<void> => {
    const influencer = await this.dataSource.getRepository(Influencer).findOne({
      where: { id: decodedToken.id },
      relations: {
        items: true,
        pinnedItem: true,
        categories: {
          items: true,
        },
      },
    });

    if (!influencer) {
      throw new CustomError(
        'The Account Is Not An Influencer or Does Not Exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const item = await this.dataSource.getRepository(Item).findOne({
      where: { id: itemId },
      relations: {
        images: true,
        comments: {
          commentLikes: true,
          commentImages: true,
          commentReports: true,
        },
        cartItems: {
          cart: true,
        },
        itemStars: true,
        itemReports: true,
      },
    });

    if (!item) {
      throw new CustomError('The Item Does Not Exist', HttpStatus.NOT_FOUND);
    }

    await this.itemService.deleteItem(influencer, item);
  };
}
