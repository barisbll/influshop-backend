import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import {
    ItemCreateRequest,
    ItemGroupCreateRequest,
    ItemWithExtraCreateRequest,
} from '../api/rest/v1/controllers/ItemOps/ItemOps.type';
import Category from '../db/entities/influencerRelated/Category';
import Influencer from '../db/entities/influencerRelated/Influencer';
import Item from '../db/entities/itemRelated/Item';
import ItemGroup from '../db/entities/itemRelated/ItemGroup';
import { CustomError } from '../util/CustomError';

@Service()
export class ItemService {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = Container.get('dataSource');
  }

  createItemGroup = async (body: ItemGroupCreateRequest, influencer: Influencer) => {
    const itemGroup = new ItemGroup();
    itemGroup.itemGroupName = body.itemGroupName;
    itemGroup.influencer = influencer;
    itemGroup.extraFeatures = body.extraFeatures.reduce((a, v) => ({ ...a, [v]: [] }), {});

    await this.dataSource.getRepository(ItemGroup).save(itemGroup);

    // eslint-disable-next-line no-param-reassign
    influencer.itemGroups = [...(influencer.itemGroups || []), itemGroup];

    await this.dataSource.getRepository(Influencer).save(influencer);
  };

  createItemWithExtra = async (body: ItemWithExtraCreateRequest, influencer: Influencer) => {
    const itemGroup = await this.dataSource.getRepository(ItemGroup).findOne({
      where: { itemGroupName: body.itemGroupName, influencer: { id: influencer.id } },
      relations: ['items'],
    });

    if (!itemGroup) {
      throw new CustomError('Item Group With Provided Name Does Not Exist');
    }

    const itemGroupExtraFeatures = new Map<string, string[]>(
      Object.entries(itemGroup.extraFeatures),
    );

    // Check if new item has all the extra features that the item group has
    if (itemGroupExtraFeatures.size !== Object.keys(body.extraFeatures).length) {
      throw new CustomError('Extra Features Do Not Cover All Extra Features Of Item Group');
    }

    const bodyExtraFeatures = new Map<string, string>(Object.entries(body.extraFeatures));

    let alreadyIncludedFeatureCounter = 0;
    bodyExtraFeatures.forEach((value, key) => {
      // Check if the extra feature is in the item group
      if (!itemGroupExtraFeatures.has(key)) {
        throw new CustomError('Extra Features Do Not Cover All Extra Features Of Item Group');
      }

      if (itemGroupExtraFeatures.get(key)?.includes(value)) {
        alreadyIncludedFeatureCounter += 1;
      }

      // Check if itemGroup extra features need to be extended
      if (!itemGroupExtraFeatures.get(key)?.includes(value)) {
        itemGroupExtraFeatures.get(key)?.push(value);
      }
    });

    if (alreadyIncludedFeatureCounter === bodyExtraFeatures.size) {
      throw new CustomError('Item With Extra Feature Already Exists');
    }

    await this.dataSource.getRepository(ItemGroup).save(itemGroup);

    const item = new Item();
    item.itemName = body.itemName;
    item.itemGroup = itemGroup;
    item.extraFeatures = body.extraFeatures;
    item.itemPrice = body.itemPrice;
    item.itemQuantity = body.itemQuantity;
    if (body.itemDescription) {
      item.itemDescription = body.itemDescription;
    }
    item.influencer = influencer;

    await this.dataSource.getRepository(Item).save(item);

    // eslint-disable-next-line no-param-reassign
    influencer.items = [...(influencer.items || []), item];
    const defaultCategory = influencer.categories?.find((category) => category.name === 'default');
    if (defaultCategory) {
      defaultCategory.items = [...(defaultCategory.items || []), item];
      item.categories = [...(item.categories || []), defaultCategory];
      await this.dataSource.getRepository(Category).save(defaultCategory);
      await this.dataSource.getRepository(Item).save(item);
    }

    await this.dataSource.getRepository(Influencer).save(influencer);

    // eslint-disable-next-line no-param-reassign
    itemGroup.items = [...(itemGroup.items || []), item];

    await this.dataSource.getRepository(ItemGroup).save(itemGroup);
  };

  createItem = async (body: ItemCreateRequest, influencer: Influencer) => {
    const item = new Item();
    item.itemName = body.itemName;
    item.itemPrice = body.itemPrice;
    item.itemQuantity = body.itemQuantity;
    if (body.itemDescription) {
      item.itemDescription = body.itemDescription;
    }
    item.influencer = influencer;

    await this.dataSource.getRepository(Item).save(item);

    // eslint-disable-next-line no-param-reassign
    influencer.items = [...(influencer.items || []), item];
    const defaultCategory = influencer.categories?.find((category) => category.name === 'default');
    if (defaultCategory) {
      defaultCategory.items = [...(defaultCategory.items || []), item];
      item.categories = [...(item.categories || []), defaultCategory];
      await this.dataSource.getRepository(Category).save(defaultCategory);
      await this.dataSource.getRepository(Item).save(item);
    }

    await this.dataSource.getRepository(Influencer).save(influencer);
  };
}
