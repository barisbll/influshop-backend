export type ItemGroupCreateRequest = {
  itemGroupName: string;
  extraFeatures: string[];
};

export type ItemWithExtraCreateRequest = {
  itemName: string;
  itemDescription?: string;
  itemPrice: number;
  itemQuantity: number;
  extraFeatures: {};
  itemGroupName: string;
  isPinned: boolean;
};

export type ItemCreateRequest = {
  itemName: string;
  itemDescription?: string;
  itemPrice: number;
  itemQuantity: number;
  isPinned: boolean;
};

export type ItemGroupUpdateRequest = {
  itemGroupName: string;
  extraFeatures: string[];
  itemGroupId: string;
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
};

export type ItemUpdateRequest = {
  itemId: string;
  itemName: string;
  itemDescription?: string;
  itemPrice: number;
  itemQuantity: number;
  isPinned: boolean;
};
