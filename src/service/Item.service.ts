import clone from 'clone';
import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import {
  ItemCreateRequest,
  ItemGroupCreateRequest,
  ItemGroupUpdateRequest,
  ItemWithExtraCreateRequest,
  ItemWithExtraUpdateRequest,
} from '../api/rest/v1/controllers/ItemOps/ItemOps.type';
import Category from '../db/entities/influencerRelated/Category';
import Influencer from '../db/entities/influencerRelated/Influencer';
import Item from '../db/entities/itemRelated/Item';
import ItemGroup from '../db/entities/itemRelated/ItemGroup';
import ItemImage from '../db/entities/itemRelated/ItemImage';
import { CustomError } from '../util/CustomError';
import { ImageUploader } from './Image.service';
import { itemSoftDeleteOperations } from './Item.helper';
import { arrayEquals, updateItemGroupExtraFeaturesOnItemDelete } from './ItemOps.helper';

@Service()
export class ItemService {
  private dataSource: DataSource;

  // eslint-disable-next-line no-unused-vars
  constructor(private readonly imageUploader: ImageUploader) {
    this.dataSource = Container.get('dataSource');
  }

  createItemGroup = async (body: ItemGroupCreateRequest, influencer: Influencer) => {
    const itemGroup = new ItemGroup();
    itemGroup.itemGroupName = body.itemGroupName;
    if (body.itemGroupDescription) itemGroup.itemGroupDescription = body.itemGroupDescription;
    itemGroup.influencer = influencer;
    itemGroup.extraFeatures = body.extraFeatures.reduce((a, v) => ({ ...a, [v]: [] }), {});

    if (body.itemGroupImage) {
      const publicId = await this.imageUploader.uploadImage(body.itemGroupImage, 'influshop_items');
      itemGroup.imageLocation = publicId;
    }

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

      if (value.trim() === '') {
        throw new CustomError('Extra Feature Value Cannot Be Empty', HttpStatus.BAD_REQUEST, {
          key,
          value,
        });
      }

      if (itemGroupExtraFeatures.get(key)?.includes(value)) {
        alreadyIncludedFeatureCounter += 1;
      }

      // Check if itemGroup extra features need to be extended
      if (!itemGroupExtraFeatures.get(key)?.includes(value)) {
        itemGroupExtraFeatures.get(key)?.push(value.trim());
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

    if (body.itemImages) {
      const orders = body.itemImages.map((imageObj) => imageObj.order);
      if (orders.length !== new Set(orders).size) {
        throw new CustomError('Item Images Order Must Be Unique');
      }

      body.itemImages.forEach(async (image) => {
        const publicId = await this.imageUploader.uploadImage(image.image, 'influshop_items');
        const itemImage = new ItemImage();
        itemImage.imageLocation = publicId;
        itemImage.imageOrder = image.order;
        itemImage.item = item;
        await this.dataSource.getRepository(ItemImage).save(itemImage);
        item.images = [...(item.images || []), itemImage];
      });
    }

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

    if (body.itemImages) {
      const orders = body.itemImages.map((imageObj) => imageObj.order);
      if (orders.length !== new Set(orders).size) {
        throw new CustomError('Item Images Order Must Be Unique');
      }

      body.itemImages.forEach(async (image) => {
        const publicId = await this.imageUploader.uploadImage(image.image, 'influshop_items');
        const itemImage = new ItemImage();
        itemImage.imageLocation = publicId;
        itemImage.imageOrder = image.order;
        itemImage.item = item;
        await this.dataSource.getRepository(ItemImage).save(itemImage);
        item.images = [...(item.images || []), itemImage];
      });
    }

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

  updateItemGroup = async (body: ItemGroupUpdateRequest, itemGroup: ItemGroup) => {
    const newExtraFeatures: Record<string, string[]> = {};
    body.extraFeatures?.forEach((extraFeature) => {
      newExtraFeatures[extraFeature] = [];
    });

    const updatedFeatures: Partial<ItemGroup> = {};

    if (body.itemGroupName) {
      updatedFeatures.itemGroupName = body.itemGroupName;
    }

    if (body.itemGroupDescription) {
      updatedFeatures.itemGroupDescription = body.itemGroupDescription;
    }

    if (body.extraFeatures) {
      updatedFeatures.extraFeatures = newExtraFeatures;
    }
    if (body.itemGroupImage) {
      let publicId: string;
      if (itemGroup.imageLocation) {
        await this.imageUploader.deleteImage(itemGroup.imageLocation);
        publicId = await this.imageUploader.uploadImage(
          body.itemGroupImage,
          'influshop_items',
        );
      } else {
        publicId = await this.imageUploader.uploadImage(body.itemGroupImage, 'influshop_items');

        updatedFeatures.imageLocation = publicId;
      }
    }

    await this.dataSource
      .createQueryBuilder()
      .update(ItemGroup)
      .set(updatedFeatures)
      .where({ id: itemGroup.id })
      .execute();
  };

  updateItemWithExtra = async (body: ItemWithExtraUpdateRequest, item: Item) => {
    let newItemGroup: ItemGroup | null = item.itemGroup as ItemGroup;
    if (body.itemGroupName && body.itemGroupName !== item.itemGroup?.itemGroupName) {
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

      if (body.extraFeatures) {
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
                const itemGroupExtraFeatures: string[] = (item.itemGroup as ItemGroup)
                  .extraFeatures[key];

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
    }

    const updatedFeatures: Partial<Item> = {};

    if (body.itemName) {
      updatedFeatures.itemName = body.itemName;
    }

    if (body.itemPrice) {
      updatedFeatures.itemPrice = body.itemPrice;
    }

    if (body.itemQuantity) {
      updatedFeatures.itemQuantity = body.itemQuantity;
    }

    if (body.itemDescription) {
      updatedFeatures.itemDescription = body.itemDescription;
    }

    if (body.extraFeatures) {
      updatedFeatures.extraFeatures = body.extraFeatures;
    }

    if (body.itemGroupName) {
      updatedFeatures.itemGroup = newItemGroup;
    }

    if (body.isPinned) {
      const influencer = await Influencer.findOne({ where: { id: item.influencer?.id } });
      if (!influencer) {
        throw new CustomError('Influencer Not Found', HttpStatus.NOT_FOUND);
      }
      influencer.pinnedItem = item;
      await influencer.save();
    }

    if (body.itemImages) {
      const oldItemImages = item.images;

      const itemImages: ItemImage[] = [];
      body.itemImages.forEach(async (bodyImage) => {
        if (bodyImage.isNew) {
          const publicId = await this.imageUploader.uploadImage(bodyImage.image, 'influshop_items');
          const itemImage = new ItemImage();
          itemImage.imageLocation = publicId;
          itemImage.imageOrder = bodyImage.order;
          itemImage.item = item;
          const newItemImage = await this.dataSource.getRepository(ItemImage).save(itemImage);
          itemImages.push(newItemImage);
        } else {
          const itemImage = await this.dataSource.getRepository(ItemImage).findOne({
            where: { imageLocation: bodyImage.image },
          });
          if (!itemImage) {
            throw new CustomError('Image Not Found', HttpStatus.NOT_FOUND);
          }
          if (itemImage.imageOrder === bodyImage.order) {
            itemImages.push(itemImage);
          } else {
            await this.dataSource
              .createQueryBuilder()
              .update(ItemImage)
              .set({
                imageOrder: bodyImage.order,
              })
              .where({ id: itemImage.id })
              .execute();
            itemImage.imageOrder = bodyImage.order;
            itemImages.push(itemImage);
          }
        }

        oldItemImages?.forEach(async (oldItemImage) => {
          if (
            !itemImages.find(
              (newItemImage) => newItemImage.imageLocation === oldItemImage.imageLocation,
            )
          ) {
            await this.imageUploader.deleteImage(oldItemImage.imageLocation as string);
            await this.dataSource.getRepository(ItemImage).delete({ id: oldItemImage.id });
          }
        });
      });
    }

    await this.dataSource
      .createQueryBuilder()
      .update(Item)
      .set(updatedFeatures)
      .where({ id: item.id })
      .execute();
  };

  updateItem = async (body: Omit<ItemWithExtraUpdateRequest, 'extraFeatures'>, item: Item) => {
    const updatedFeatures: Partial<Item> = {};

    if (body.itemName) {
      updatedFeatures.itemName = body.itemName;
    }

    if (body.itemPrice) {
      updatedFeatures.itemPrice = body.itemPrice;
    }

    if (body.itemQuantity) {
      updatedFeatures.itemQuantity = body.itemQuantity;
    }

    if (body.itemDescription) {
      updatedFeatures.itemDescription = body.itemDescription;
    }

    if (body.isPinned) {
      const influencer = await Influencer.findOne({ where: { id: item.influencer?.id } });
      if (!influencer) {
        throw new CustomError('Influencer Not Found', HttpStatus.NOT_FOUND);
      }
      influencer.pinnedItem = item;
      await influencer.save();
    }

    if (body.itemImages) {
      const oldItemImages = item.images;

      const itemImages: ItemImage[] = [];
      body.itemImages.forEach(async (bodyImage) => {
        if (bodyImage.isNew) {
          const publicId = await this.imageUploader.uploadImage(bodyImage.image, 'influshop_items');
          const itemImage = new ItemImage();
          itemImage.imageLocation = publicId;
          itemImage.imageOrder = bodyImage.order;
          itemImage.item = item;
          const newItemImage = await this.dataSource.getRepository(ItemImage).save(itemImage);
          itemImages.push(newItemImage);
        } else {
          const itemImage = await this.dataSource.getRepository(ItemImage).findOne({
            where: { imageLocation: bodyImage.image },
          });
          if (!itemImage) {
            throw new CustomError('Image Not Found', HttpStatus.NOT_FOUND);
          }
          if (itemImage.imageOrder === bodyImage.order) {
            itemImages.push(itemImage);
          } else {
            await this.dataSource
              .createQueryBuilder()
              .update(ItemImage)
              .set({
                imageOrder: bodyImage.order,
              })
              .where({ id: itemImage.id })
              .execute();
            itemImage.imageOrder = bodyImage.order;
            itemImages.push(itemImage);
          }
        }

        oldItemImages?.forEach(async (oldItemImage) => {
          if (
            !itemImages.find(
              (newItemImage) => newItemImage.imageLocation === oldItemImage.imageLocation,
            )
          ) {
            await this.imageUploader.deleteImage(oldItemImage.imageLocation as string);
            await this.dataSource.getRepository(ItemImage).delete({ id: oldItemImage.id });
          }
        });
      });
    }

    await this.dataSource
      .createQueryBuilder()
      .update(Item)
      .set(updatedFeatures)
      .where({ id: item.id })
      .execute();
  };

  deleteItemGroup = async (oldInfluencer: Influencer, itemGroup: ItemGroup) => {
    const influencer = clone(oldInfluencer);

    influencer.itemGroups = influencer.itemGroups?.filter(
      (itemGroupInfluencer) => itemGroupInfluencer.id !== itemGroup.id,
    );

    await this.dataSource.getRepository(Influencer).save(influencer);

    this.imageUploader.deleteImage(itemGroup.imageLocation as string);

    await this.dataSource
      .getRepository(ItemGroup)
      .createQueryBuilder()
      .softDelete()
      .from(ItemGroup)
      .where('id = :id', { id: itemGroup.id })
      .execute();
  };

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

    item.images?.forEach(async (itemImage) => {
      await this.imageUploader.deleteImage(itemImage.imageLocation as string);
      await this.dataSource
        .getRepository(ItemImage)
        .createQueryBuilder()
        .delete()
        .from(ItemImage)
        .where('id = :id', { id: itemImage.id })
        .execute();
    });

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

    item.images?.forEach(async (itemImage) => {
      await this.imageUploader.deleteImage(itemImage.imageLocation as string);
      await this.dataSource
        .getRepository(ItemImage)
        .createQueryBuilder()
        .delete()
        .from(ItemImage)
        .where('id = :id', { id: itemImage.id })
        .execute();
    });

    await itemSoftDeleteOperations(item, this.dataSource);
  };
}
