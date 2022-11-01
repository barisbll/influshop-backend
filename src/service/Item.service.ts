import clone from 'clone';
import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import {
  ItemCreateRequest,
  ItemGroupCreateRequest,
  ItemUpdateRequest,
  ItemWithExtraCreateRequest,
  ItemWithExtraUpdateRequest,
} from '../api/rest/v1/controllers/ItemOps/ItemOps.type';
import Category from '../db/entities/influencerRelated/Category';
import Influencer from '../db/entities/influencerRelated/Influencer';
import Item from '../db/entities/itemRelated/Item';
import ItemGroup from '../db/entities/itemRelated/ItemGroup';
import { CustomError } from '../util/CustomError';
import { itemSoftDeleteOperations } from './Item.helper';
import { arrayEquals, updateItemGroupExtraFeaturesOnItemDelete } from './ItemOps.helper';

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

  createItemWithExtra = async (body: ItemWithExtraCreateRequest, influencerOld: Influencer) => {
    const influencer = clone(influencerOld);

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

    influencer.items = [...(influencer.items || []), item];
    influencer.pinnedItem = body.isPinned ? item : influencer.pinnedItem;

    const defaultCategory = influencer.categories?.find((category) => category.name === 'default');
    if (defaultCategory) {
      defaultCategory.items = [...(defaultCategory.items || []), item];
      item.categories = [...(item.categories || []), defaultCategory];
      await this.dataSource.getRepository(Category).save(defaultCategory);
      await this.dataSource.getRepository(Item).save(item);
    }

    await this.dataSource.getRepository(Influencer).save(influencer);

    itemGroup.items = [...(itemGroup.items || []), item];

    await this.dataSource.getRepository(ItemGroup).save(itemGroup);
  };

  createItem = async (body: ItemCreateRequest, influencerOld: Influencer) => {
    const influencer = clone(influencerOld);

    const item = new Item();
    item.itemName = body.itemName;
    item.itemPrice = body.itemPrice;
    item.itemQuantity = body.itemQuantity;
    if (body.itemDescription) {
      item.itemDescription = body.itemDescription;
    }
    item.influencer = influencer;

    await this.dataSource.getRepository(Item).save(item);

    influencer.items = [...(influencer.items || []), item];
    influencer.pinnedItem = body.isPinned ? item : influencer.pinnedItem;

    const defaultCategory = influencer.categories?.find((category) => category.name === 'default');
    if (defaultCategory) {
      defaultCategory.items = [...(defaultCategory.items || []), item];
      item.categories = [...(item.categories || []), defaultCategory];
      await this.dataSource.getRepository(Category).save(defaultCategory);
      await this.dataSource.getRepository(Item).save(item);
    }

    await this.dataSource.getRepository(Influencer).save(influencer);
  };

  updateItemGroup = async (body: ItemGroupCreateRequest, itemGroup: ItemGroup) => {
    const newExtraFeatures: Record<string, string[]> = {};
    body.extraFeatures.forEach((extraFeature) => {
      newExtraFeatures[extraFeature] = [];
    });

    await this.dataSource
      .createQueryBuilder()
      .update(ItemGroup)
      .set({ itemGroupName: body.itemGroupName, extraFeatures: newExtraFeatures })
      .where({ id: itemGroup.id })
      .execute();
  };

  updateItemWithExtra = async (body: ItemWithExtraUpdateRequest, item: Item) => {
    let newItemGroup: ItemGroup | null = item.itemGroup as ItemGroup;
    if (body.itemGroupName !== item.itemGroup?.itemGroupName) {
      newItemGroup = await this.dataSource.getRepository(ItemGroup).findOne({
        where: { itemGroupName: body.itemGroupName, influencer: { id: item.influencer?.id } },
        relations: ['items'],
      });

      if (!newItemGroup) {
        throw new CustomError('Item Group With Provided Name Does Not Exist', HttpStatus.NOT_FOUND);
      }

      if (!arrayEquals(Object.keys(newItemGroup.extraFeatures), Object.keys(item.extraFeatures))) {
        throw new CustomError(
          'Update For ItemGroups With Different Extra Features Currently Not Supported',
        );
      }

      const itemFeatureCounter = new Map<string, number>();
      Object.keys(item.extraFeatures).forEach((key) => {
        itemFeatureCounter.set(key, 0);
      });

      for (let i = 0; i < (item.itemGroup?.items?.length as number); i += 1) {
        const itemInGroup = item.itemGroup?.items?.[i] as Item;

        let isAllFeaturesIncluded = true;
        itemFeatureCounter.forEach((value, key) => {
          if (itemInGroup.extraFeatures[key] === item.extraFeatures[key]) {
            itemFeatureCounter.set(key, value + 1);

            isAllFeaturesIncluded =
              (itemFeatureCounter.get(key) as number) > 1 && isAllFeaturesIncluded && i !== 0;
          }
        });
        // if (isAllFeaturesIncluded) {
        //   break;
        // }

        if (i === (item.itemGroup?.items?.length as number) - 1) {
          itemFeatureCounter.forEach((value, key) => {
            if (value === 1) {
              const itemGroupExtraFeatures: string[] = (item.itemGroup as ItemGroup).extraFeatures[
                key
              ];

              const filteredExtraFeatures = itemGroupExtraFeatures.filter(
                (extraFeature) => extraFeature !== item.extraFeatures[key],
              );
              // eslint-disable-next-line no-param-reassign
              (item.itemGroup as ItemGroup).extraFeatures[key] = filteredExtraFeatures;
            }
          });
        }
      }
    }
    if (body.itemGroupName !== item.itemGroup?.itemGroupName) {
      // update old item group
      await this.dataSource
        .createQueryBuilder()
        .update(ItemGroup)
        .set({
          extraFeatures: item.itemGroup?.extraFeatures,
        })
        .where({ id: item.itemGroup?.id })
        .execute();

      Object.keys(newItemGroup.extraFeatures).forEach((key) => {
        if (!(newItemGroup as ItemGroup).extraFeatures[key].includes(item.extraFeatures[key])) {
          (newItemGroup as ItemGroup).extraFeatures[key].push(item.extraFeatures[key]);
        }
      });

      // update new item group
      await this.dataSource
        .createQueryBuilder()
        .update(ItemGroup)
        .set({
          extraFeatures: newItemGroup.extraFeatures,
        })
        .where({ id: newItemGroup.id })
        .execute();
    }

    await this.dataSource
      .createQueryBuilder()
      .update(Item)
      .set({
        itemName: body.itemName,
        itemPrice: body.itemPrice,
        itemQuantity: body.itemQuantity,
        itemDescription: body.itemDescription,
        extraFeatures: body.extraFeatures,
        itemGroup: newItemGroup,
      })
      .where({ id: item.id })
      .execute();
  };

  updateItem = async (body: ItemUpdateRequest, item: Item) => {
    await this.dataSource
      .createQueryBuilder()
      .update(Item)
      .set({
        itemName: body.itemName,
        itemPrice: body.itemPrice,
        itemQuantity: body.itemQuantity,
        itemDescription: body.itemDescription,
      })
      .where({ id: item.id })
      .execute();
  };

  deleteItemGroup = async (oldInfluencer: Influencer, itemGroup: ItemGroup) => {
    const influencer = clone(oldInfluencer);

    influencer.itemGroups = influencer.itemGroups?.filter(
      (itemGroupInfluencer) => itemGroupInfluencer.id !== itemGroup.id,
    );

    await this.dataSource.getRepository(Influencer).save(influencer);

    await this.dataSource
      .getRepository(ItemGroup)
      .createQueryBuilder()
      .softDelete()
      .from(ItemGroup)
      .where('id = :id', { id: itemGroup.id })
      .execute();
  };

  // solve the itemGroup issue and also make the update modular (maybe after delete)
  deleteItemWithExtra = async (oldInfluencer: Influencer, item: Item) => {
    const influencer = clone(oldInfluencer);

    const itemGroup = influencer.itemGroups?.find(
      (itemGroupInfluencer) => itemGroupInfluencer.id === item.itemGroup?.id,
    );

    if (itemGroup) {
      const updatedItemGroup = updateItemGroupExtraFeaturesOnItemDelete(itemGroup, item);
      updatedItemGroup.items = updatedItemGroup.items?.filter(
        (itemGroupItem) => itemGroupItem.id !== item.id,
      );
      await this.dataSource.getRepository(ItemGroup).save(updatedItemGroup);
    }

    if (influencer?.pinnedItem?.id === item.id) {
      influencer.pinnedItem = undefined;
    }

    const defaultCategory = influencer.categories?.find((category) => category.name === 'default');
    if (defaultCategory) {
      defaultCategory.items = defaultCategory.items?.filter(
        (defaultCategoryItem) => defaultCategoryItem.id !== item.id,
      );
      await this.dataSource.getRepository(Category).save(defaultCategory);
    }

    await this.dataSource.getRepository(Influencer).save(influencer);

    await itemSoftDeleteOperations(item, this.dataSource);
  };

  deleteItem = async (oldInfluencer: Influencer, item: Item) => {
    const influencer = clone(oldInfluencer);

    const defaultCategory = influencer.categories?.find((category) => category.name === 'default');
    if (defaultCategory) {
      defaultCategory.items = defaultCategory.items?.filter(
        (defaultCategoryItem) => defaultCategoryItem.id !== item.id,
      );
      await this.dataSource.getRepository(Category).save(defaultCategory);
    }

    if (influencer?.pinnedItem?.id === item.id) {
      influencer.pinnedItem = undefined;
    }

    await this.dataSource.getRepository(Influencer).save(influencer);

    await itemSoftDeleteOperations(item, this.dataSource);
  };
}
