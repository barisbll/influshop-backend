import { DataSource } from 'typeorm';
import Comment from '../db/entities/itemRelated/Comment';
import CommentImage from '../db/entities/itemRelated/CommentImage';
import CommentLike from '../db/entities/itemRelated/CommentLike';
import CommentReport from '../db/entities/itemRelated/CommentReport';
import Item from '../db/entities/itemRelated/Item';
import ItemReport from '../db/entities/itemRelated/ItemReport';
import ItemStar from '../db/entities/itemRelated/ItemStar';
import Cart from '../db/entities/userRelated/Cart';
import CartItem from '../db/entities/userRelated/CartItem';

export const itemSoftDeleteOperations = async (item: Item, dataSource: DataSource) => {
  // delete comments
  item.comments?.forEach(async (comment) => {
    comment.commentImages?.forEach(async (commentImage) => {
      await dataSource
        .getRepository(CommentImage)
        .createQueryBuilder()
        .softDelete()
        .from(CommentImage)
        .where('id = :id', { id: commentImage.id })
        .execute();
    });

    comment.commentLikes?.forEach(async (commentLike) => {
      await dataSource
        .getRepository(CommentLike)
        .createQueryBuilder()
        .softDelete()
        .from(CommentLike)
        .where('id = :id', { id: commentLike.id })
        .execute();
    });

    comment.commentReports?.forEach(async (commentReport) => {
      await dataSource
        .getRepository(CommentReport)
        .createQueryBuilder()
        .softDelete()
        .from(CommentReport)
        .where('id = :id', { id: commentReport.id })
        .execute();
    });

    await dataSource
      .getRepository(Comment)
      .createQueryBuilder()
      .softDelete()
      .from(Comment)
      .where('id = :id', { id: comment.id })
      .execute();
  });

  // delete cart items
  item.cartItems?.forEach(async (cartItem) => {
    cartItem.cart?.cartItems?.filter(async (cartItemInCart) => {
      if (cartItemInCart.id === cartItem.id) {
        cartItemInCart.cart?.cartItems?.splice(
          cartItemInCart.cart?.cartItems?.indexOf(cartItemInCart),
          1,
        );
        await dataSource.getRepository(Cart).save(cartItemInCart.cart as Cart);
      }
    });
    await dataSource
      .getRepository(CartItem)
      .createQueryBuilder()
      .softDelete()
      .from(CartItem)
      .where('id = :id', { id: cartItem.id })
      .execute();
  });

  // delete itemStars
  item.itemStars?.forEach(async (itemStar) => {
    await dataSource
      .getRepository(ItemStar)
      .createQueryBuilder()
      .softDelete()
      .from(ItemStar)
      .where('id = :id', { id: itemStar.id })
      .execute();
  });

  // delete itemReports
  item.itemReports?.forEach(async (itemReport) => {
    await dataSource
      .getRepository(ItemReport)
      .createQueryBuilder()
      .softDelete()
      .from(ItemReport)
      .where('id = :id', { id: itemReport.id })
      .execute();
  });

  // lastly delete item
  await dataSource
    .getRepository(Item)
    .createQueryBuilder()
    .softDelete()
    .from(Item)
    .where('id = :id', { id: item.id })
    .execute();
};
