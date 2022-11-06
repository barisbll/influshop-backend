import Comment from '../db/entities/itemRelated/Comment';
import Item from '../db/entities/itemRelated/Item';
import ItemGroup from '../db/entities/itemRelated/ItemGroup';
import User from '../db/entities/userRelated/User';
import { MappedCommentImages, MappedComments, MappedObject } from './ItemOps.type';

export const itemsMapper = (
  items: Item[] | undefined,
  pinnedItemId: string | undefined,
): MappedObject[] => {
  const mappedItems = items?.map((item) => {
    if (item.itemGroup) {
      const { itemGroupName, imageLocation, id } = item.itemGroup;
      return {
        type: 'itemGroup',
        id,
        name: itemGroupName,
        description: item.itemGroup.itemGroupDescription,
        imageLocation,
        price: item.itemPrice,
        available: (item.itemQuantity || 1) > 0,
        averageStars: item.averageStars,
        commentsLength: item.totalComments,
        isPinned: pinnedItemId === item.id,
        updatedAt: item.itemGroup.updatedAt,
      };
    }

    return {
      type: 'item',
      id: item.id,
      name: item.itemName,
      description: item.itemDescription,
      imageLocation: item.images?.[0]?.imageLocation || null,
      price: item.itemPrice,
      available: (item.itemQuantity || 1) > 0,
      averageStars: item.averageStars,
      commentsLength: item.totalComments,
      isPinned: pinnedItemId === item.id,
      updatedAt: item.updated_at,
    };
  });

  const counterObj: { [key: string]: number } = {};
  return (mappedItems as MappedObject[])?.reduce((acc, current) => {
    const itemGroupIdx = acc.findIndex((element) => element.id === current.id);
    if (itemGroupIdx > -1) {
      acc[itemGroupIdx].commentsLength += current.commentsLength;

      if (current.averageStars) {
        if (counterObj[current.id]) {
          counterObj[current.id] += 1;
        } else {
          // eslint-disable-next-line no-lonely-if
          if (acc[itemGroupIdx].averageStars) {
            counterObj[current.id] = 2;
          } else {
            counterObj[current.id] = 1;
          }
        }
        acc[itemGroupIdx].averageStars =
          ((acc[itemGroupIdx].averageStars || 0) + current.averageStars) / counterObj[current.id];
      }

      if (current.isPinned) {
        acc[itemGroupIdx].isPinned = true;
      }

      return acc;
    }
    return [...acc, current];
  }, [] as MappedObject[]);
};

export function arrayEquals(a: string[], b: string[]): boolean {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

export const updateItemGroupExtraFeaturesOnItemDelete = (
  itemGroup: ItemGroup,
  item: Item,
): ItemGroup => {
  // check the logic, maybe modulate also the previous itemWithExtra
  const itemFeatureCounter = new Map<string, number>();
  Object.keys(item.extraFeatures).forEach((key) => {
    itemFeatureCounter.set(key, 0);
  });

  for (let i = 0; i < (itemGroup.items?.length as number); i += 1) {
    const itemInGroup = itemGroup?.items?.[i] as Item;

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

    if (i === (itemGroup?.items?.length as number) - 1) {
      itemFeatureCounter.forEach((value, key) => {
        if (value === 1) {
          const itemGroupExtraFeatures: string[] = (item.itemGroup as ItemGroup).extraFeatures[key];

          const filteredExtraFeatures = itemGroupExtraFeatures.filter(
            (extraFeature) => extraFeature !== item.extraFeatures[key],
          );
          // eslint-disable-next-line no-param-reassign
          itemGroup.extraFeatures[key] = filteredExtraFeatures;
        }
      });
    }
  }
  return itemGroup;
};

export const commentsMapper = (comments: Comment[] | undefined): MappedComments[] | undefined => {
  const mappedComments = comments?.map((comment) => {
    const commentImages: MappedCommentImages[] | undefined = comment.commentImages?.map(
      (image) => ({
        image: image.imageLocation as string,
        order: image.imageOrder as number,
      }),
    );

    return {
      id: (comment.id as string),
      comment: (comment.comment as string),
      likes: (comment.likes as number),
      dislikes: (comment.dislikes as number),
      createdAt: (comment.createdAt as Date),
      updatedAt: (comment.updatedAt as Date),
      commentImages,
      username: ((comment.user as User).username as string),
    };
  });

  return mappedComments;
};
