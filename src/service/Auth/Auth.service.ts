import HttpStatus from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { UserSignupRequest } from '../../api/rest/v1/controllers/Auth/Auth.types';
import User from '../../db/entities/userRelated/User';
import { UserService } from './User.service';

import Influencer from '../../db/entities/influencerRelated/Influencer';
import { CustomError } from '../../util/CustomError';

// TODO: Later Create user and Influencer service, use them for entity creation
// TODO: Check For Username uniqueness
@Service()
export class AuthService {
  private dataSource: DataSource;

  private userService: UserService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.userService = Container.get(UserService);
  }

  isEmailUniqueUser = async (email: string): Promise<boolean> => {
    const user = await this.dataSource.getRepository(User).findOne({ where: { email } });

    const influencer = await this.dataSource
      .getRepository(Influencer)
      .findOne({ where: { email } });

    if (user || influencer) {
      return false;
    }
    return true;
  };

  isUsernameUnique = async (username: string): Promise<boolean> => {
    const user = await this.dataSource.getRepository(User).findOne({ where: { username } });

    const influencer = await this.dataSource
      .getRepository(Influencer)
      .findOne({ where: { username } });

    if (user || influencer) {
      return false;
    }
    return true;
  };

  signupUser = async (req: UserSignupRequest) => {
    const isEmailUnique = await this.isEmailUniqueUser(req.email);
    if (!isEmailUnique) {
      throw new CustomError('Email already exists', HttpStatus.CONFLICT, {
        email: req.email,
      });
    }

    const isUsernameUnique = await this.isUsernameUnique(req.username);
    if (!isUsernameUnique) {
      throw new CustomError('Username already exists', HttpStatus.CONFLICT, {
        username: req.username,
      });
    }

    this.userService.createUser(req);
  };

  loginUser = async () => {
    console.log('Login user');
  };

  logoutUser = async () => {
    console.log('Logout user');
  };

  signupInfluencer = async () => {
    console.log('Signup influencer');
  };

  loginInfluencer = async () => {
    console.log('Login influencer');
  };

  logoutInfluencer = async () => {
    console.log('Logout influencer');
  };
}
