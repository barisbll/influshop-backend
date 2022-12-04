import ItemImage from '../db/entities/itemRelated/ItemImage';

export interface MappedObject {
  type: string;
  id: string;
  name: string;
  description: string;
  imageLocation: string | null;
  price: number;
  available: boolean;
  averageStars: number | undefined;
  commentsLength: number;
  isPinned: boolean;
}

export type MappedCommentImages = {
  image: string;
  order: number;
};

export type MappedComments = {
  id: string;
  comment: string;
  likes: number;
  dislikes: number;
  createdAt: Date;
  updatedAt: Date;
  commentImages: MappedCommentImages[] | undefined;
  username: string;
};

export interface ItemGetResult {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  averageStars: number | undefined;
  totalComments: number;
  comments: MappedComments[] | undefined;
  images: ItemImage[] | undefined;
  extraFeatures: Record<string, string> | undefined;
}
