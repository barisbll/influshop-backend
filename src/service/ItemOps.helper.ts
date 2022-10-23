import Item from '../db/entities/itemRelated/Item';
import { MappedObject } from './ItemOps.type';

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
        imageLocation,
        price: item.itemPrice,
        available: (item.itemQuantity || 1) > 0,
        averageStars: item.averageStars,
        commentsLength: item.comments?.length,
        isPinned: pinnedItemId === item.id,
      };
    }

    return {
      type: 'item',
      id: item.id,
      name: item.itemName,
      imageLocation: item.images?.[0]?.imageLocation || null,
      price: item.itemPrice,
      available: (item.itemQuantity || 1) > 0,
      averageStars: item.averageStars,
      commentsLength: item.comments?.length,
      isPinned: pinnedItemId === item.id,
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
