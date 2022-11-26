import { hash } from 'bcryptjs';
import { Container, Inject, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { SignupRequest } from '../api/rest/v1/controllers/Auth/Auth.type';
import Favorite from '../db/entities/userRelated/Favorite';
import User from '../db/entities/userRelated/User';

@Service()
export class UserService {
  @Inject('dataSource')
  private dataSource: DataSource;

  constructor() {
    this.dataSource = Container.get('dataSource');
  }

  createUser = async (req: SignupRequest): Promise<string> => {
    const user = new User();
    user.password = await hash(req.password, 12);
    user.username = req.username;
    user.email = req.email;

    const favorite = new Favorite();
    await this.dataSource.manager.save(favorite);

    // relations
    favorite.user = user;
    user.favorite = favorite;

    const savedUser = await this.dataSource.manager.save(user);
    await this.dataSource.manager.save(favorite);

    return savedUser.username as string;
};
}
