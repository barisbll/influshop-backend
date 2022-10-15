import { Container, Inject, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { UserSignupRequest } from '../../api/rest/v1/controllers/Auth/Auth.types';
import Cart from '../../db/entities/userRelated/Cart';
import Favorite from '../../db/entities/userRelated/Favorite';
import User from '../../db/entities/userRelated/User';

@Service()
export class UserService {
  @Inject('dataSource')
  private dataSource: DataSource;

  constructor() {
    this.dataSource = Container.get('dataSource');
  }

  // TODO: bcrypt password
  createUser = async (req: UserSignupRequest) => {
    const user = new User();
    user.username = req.username;
    user.email = req.email;
    user.password = req.password;

    const cart = new Cart();
    await this.dataSource.manager.save(cart);

    const favorite = new Favorite();
    await this.dataSource.manager.save(favorite);

    // relations
    cart.user = user;
    favorite.user = user;
    user.cart = cart;
    user.favorite = favorite;

    await this.dataSource.manager.save(user);
    await this.dataSource.manager.save(cart);
    await this.dataSource.manager.save(favorite);
};
}
