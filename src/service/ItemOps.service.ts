import HttpStatus from 'http-status-codes';
import { isDeepStrictEqual } from 'node:util';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { RefreshTokenRequest } from '../api/rest/v1/controllers/Auth/Auth.type';
import {
  ItemCreateRequest,
  ItemGroupCreateRequest,
  ItemGroupUpdateRequest,
  ItemWithExtraCreateRequest,
  ItemWithExtraUpdateRequest,
} from '../api/rest/v1/controllers/ItemOps/ItemOps.type';
import Influencer from '../db/entities/influencerRelated/Influencer';
import Item from '../db/entities/itemRelated/Item';
import ItemGroup from '../db/entities/itemRelated/ItemGroup';
import { CustomError } from '../util/CustomError';
import { ItemService } from './Item.service';
import { arrayEquals, commentsMapper, itemsMapper, mainPageItemsMapper } from './ItemOps.helper';
import { ItemGetResult, MappedObject } from './ItemOps.type';
import User from '../db/entities/userRelated/User';
import { config } from '../config/config';

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
      const { itemGroupName, itemGroupDescription, extraFeatures, id, imageLocation } = itemGroup;
      return { itemGroupName, itemGroupDescription, extraFeatures, id, imageLocation };
    });
  };

  itemGroupGet = async (id: string) => {
    const itemGroup = await this.dataSource.getRepository(ItemGroup).findOne({
      where: { id },
      relations: {
        influencer: true,
      },
    });

    if (!itemGroup) {
      throw new CustomError('Item Group Does Not Exist', HttpStatus.NOT_FOUND);
    }

    const {
      itemGroupName,
      itemGroupDescription,
      extraFeatures,
      imageLocation,
      isVisible,
      influencer,
    } = itemGroup;

    return {
      itemGroupName,
      itemGroupDescription,
      extraFeatures,
      imageLocation,
      isVisible,
      influencerName: (influencer as Influencer).username,
      influencerId: (influencer as Influencer).id,
    };
  };

  itemsGet = async (influencerName: string): Promise<MappedObject[]> => {
    const influencer = await this.dataSource.getRepository(Influencer).findOne({
      where: { username: influencerName },
      relations: {
        items: {
          itemGroup: true,
          images: true,
          comments: false,
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

  mainPageItemsGet = async (decodedToken: RefreshTokenRequest | undefined, pageId: number) => {
    let user: User | null = null;
    if (decodedToken) {
      user = await this.dataSource.getRepository(User).findOne({
        where: { id: decodedToken.id },
      });

      if (!user) {
        throw new CustomError('The User Does Not Exist', HttpStatus.NOT_FOUND);
      }
    }

    const result = await this.dataSource.getRepository(Item).find({
      order: {
        created_at: 'DESC',
      },
      relations: {
        itemGroup: true,
        images: true,
        influencer: true,
      },
      skip: (pageId - 1) * config.mainPageItemLimit,
      take: config.mainPageItemLimit,
    });

    return mainPageItemsMapper(result, 'undefined-uuid');
  };

  itemGet = async (
    itemId: string,
    decodedToken: RefreshTokenRequest | undefined,
  ): Promise<Omit<ItemGetResult, 'extraFeatures'>> => {
    let user: User | null = null;
    if (decodedToken) {
      user = await this.dataSource.getRepository(User).findOne({
        where: { id: decodedToken.id },
        relations: {
          commentLikes: {
            comment: true,
          },
        },
      });

      if (!user) {
        throw new CustomError('The User Does Not Exist', HttpStatus.NOT_FOUND);
      }
    }

    const item = await this.dataSource.getRepository(Item).findOne({
      where: { id: itemId },
      relations: {
        comments: {
          commentImages: true,
          user: true,
          commentLikes: {
            user: !!user,
          },
        },
        images: true,
      },
    });

    if (!item) {
      throw new CustomError('The Item Does Not Exist', HttpStatus.NOT_FOUND);
    }

    const {
      id,
      itemName,
      itemPrice,
      itemQuantity,
      averageStars,
      totalComments,
      comments,
      images,
      itemDescription,
    } = item;

    const mappedImages = images?.map((image) => {
      const { imageLocation, imageOrder } = image;
      return { imageLocation, imageOrder };
    });

    return {
      id: id as string,
      name: itemName as string,
      description: itemDescription as string,
      price: itemPrice as number,
      available: (itemQuantity || 1) > 0,
      averageStars,
      totalComments: totalComments as number,
      comments: commentsMapper(comments, user?.commentLikes),
      images: mappedImages,
    };
  };

  itemGetWithExtraFeatures = async (
    influencerName: string,
    itemGroupName: string,
    queryParams: unknown,
    decodedToken: RefreshTokenRequest | undefined,
  ): Promise<ItemGetResult> => {
    let user: User | null = null;
    if (decodedToken) {
      user = await this.dataSource.getRepository(User).findOne({
        where: { id: decodedToken.id },
        relations: {
          commentLikes: {
            comment: true,
          },
        },
      });

      if (!user) {
        throw new CustomError('The User Does Not Exist', HttpStatus.NOT_FOUND);
      }
    }

    const influencer = await this.dataSource.getRepository(Influencer).findOne({
      where: {
        username: influencerName,
      },
      relations: {
        itemGroups: {
          items: {
            images: true,
            comments: {
              commentImages: true,
              user: true,
              commentLikes: {
                user: !!user,
              },
            },
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

    const {
      id,
      itemName,
      itemPrice,
      itemQuantity,
      averageStars,
      totalComments,
      comments,
      images,
      extraFeatures,
      itemDescription,
    } = result;

    const mappedImages = images?.map((image) => {
      const { imageLocation, imageOrder } = image;
      return { imageLocation, imageOrder };
    });

    return {
      id: id as string,
      name: itemName as string,
      description: itemDescription as string,
      price: itemPrice as number,
      available: (itemQuantity || 1) > 0,
      averageStars,
      totalComments: totalComments as number,
      comments: commentsMapper(comments, user?.commentLikes),
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
      body.itemGroupName &&
      !(await this.isItemGroupNameUniqueToInfluencer(body.itemGroupName, influencer)) &&
      body.itemGroupName !== itemGroup.itemGroupName
    ) {
      throw new CustomError(
        'The Item Group Name Is Not Unique To The Influencer',
        HttpStatus.CONFLICT,
      );
    }

    if (
      body.extraFeatures &&
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
        images: true,
      },
    });

    if (!item) {
      throw new CustomError('The Item Does Not Exist', HttpStatus.NOT_FOUND);
    }

    await this.itemService.updateItemWithExtra(body, item);
  };

  itemUpdate = async (
    body: Omit<ItemWithExtraUpdateRequest, 'extraFeatures'>,
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
        images: true,
      },
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
        cartItems: true,
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
        cartItems: true,
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
