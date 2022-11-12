/* eslint-disable no-else-return */
import clone from 'clone';
import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { CustomError } from '../../util/CustomError';
import Item from '../../db/entities/itemRelated/Item';
import User from '../../db/entities/userRelated/User';
import { StarCreateRequest } from '../../api/rest/v1/controllers/Star/Star.type';
import ItemStar from '../../db/entities/itemRelated/ItemStar';

@Service()
export class StarCRUDService {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = Container.get('dataSource');
  }

  starCreate = async (body: StarCreateRequest, oldUser: User, oldItem: Item): Promise<void> => {
    const user = clone(oldUser);
    const item = clone(oldItem);

    if (user.itemStars) {
      const itemStar = user.itemStars.find((star) => (star.item as Item).id === item.id);
      if (itemStar) {
        // If the user already has a star for this item, update the star
        if (itemStar.stars === body.stars) {
          throw new CustomError(
            'User cannot update the star with the old star value',
            HttpStatus.CONFLICT,
          );
        }
        const oldStarValue = itemStar.stars as number;
        const newStarValue = body.stars as number;
        const totalNumberOfStars = item.itemStars?.length as number;
        const oldAverageStarValue = item.averageStars as number;
        const newAverage =
          (oldAverageStarValue * totalNumberOfStars - oldStarValue + newStarValue) /
          totalNumberOfStars;
        itemStar.stars = body.stars;
        await this.dataSource.getRepository(ItemStar).save(itemStar);
        item.averageStars = newAverage;
        await this.dataSource.getRepository(Item).save(item);
      } else {
        // If the user does not have a star for this item, create a new star
        const star = new ItemStar();
        star.user = user;
        star.item = item;
        star.stars = body.stars;
        await this.dataSource.getRepository(ItemStar).save(star);

        user.itemStars = [...(user.itemStars || []), star];
        await this.dataSource.getRepository(User).save(user);

        const newAverage =
          ((item.itemStars?.length || 0) * (item.averageStars || 0) + body.stars) /
          ((item.itemStars?.length || 0) + 1);
        item.averageStars = newAverage;
        item.itemStars = [...(item.itemStars || []), star];
        await this.dataSource.getRepository(Item).save(item);
      }
    }
  };
}
