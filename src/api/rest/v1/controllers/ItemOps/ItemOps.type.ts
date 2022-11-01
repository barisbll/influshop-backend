export type ItemGroupCreateRequest = {
  itemGroupName: string;
  extraFeatures: string[];
  itemGroupImage?: string;
};

type ImageWithOrder = {
  image: string;
  order: number;
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

export type ItemGroupUpdateRequest = {
  itemGroupName: string;
  extraFeatures: string[];
  itemGroupId: string;
  itemGroupImage?: string;
};

export type ItemWithExtraUpdateRequest = {
  itemId: string;
  itemName: string;
  itemDescription?: string;
  itemPrice: number;
  itemQuantity: number;
  extraFeatures: {};
  itemGroupName: string;
  isPinned: boolean;
  itemImages?: ImageWithOrder[];
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
