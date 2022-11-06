export type ItemGroupCreateRequest = {
  itemGroupName: string;
  itemGroupDescription ?: string;
  extraFeatures: string[];
  itemGroupImage?: string;
};

export type ItemGroupUpdateRequest = {
  itemGroupId: string;
  itemGroupName?: string;
  itemGroupDescription?: string;
  extraFeatures?: string[];
  itemGroupImage?: string;
};

type ImageWithOrder = {
  image: string;
  order: number;
};

export type ImageWithOrderUpdate = {
  image: string;
  order: number;
  isNew: boolean;
};

export type ItemWithExtraCreateRequest = {
  itemName: string;
  itemDescription?: string;
  itemPrice: number;
  itemQuantity: number;
  extraFeatures: {};
  itemGroupName: string;
  isPinned: boolean;
  itemImages?: ImageWithOrder[];
};

export type ItemCreateRequest = {
  itemName: string;
  itemDescription?: string;
  itemPrice: number;
  itemQuantity: number;
  isPinned: boolean;
  itemImages?: ImageWithOrder[];
};

export type ItemWithExtraUpdateRequest = {
  itemId: string;
  itemName?: string;
  itemDescription?: string;
  itemPrice?: number;
  itemQuantity?: number;
  extraFeatures?: {};
  itemGroupName?: string;
  isPinned?: boolean;
  itemImages?: ImageWithOrderUpdate[];
};

export type ItemUpdateRequest = {
  itemId: string;
  itemName: string;
  itemDescription?: string;
  itemPrice: number;
  itemQuantity: number;
  isPinned: boolean;
  itemImages?: ImageWithOrder[];
};
