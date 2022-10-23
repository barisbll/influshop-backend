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
