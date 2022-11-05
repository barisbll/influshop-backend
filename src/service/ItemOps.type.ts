import Comment from '../db/entities/itemRelated/Comment';
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

export interface ItemGetResult {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  averageStars: number | undefined;
  comments: Comment[] | undefined;
  images: ItemImage[] | undefined;
  extraFeatures: Record<string, string> | undefined;
}
