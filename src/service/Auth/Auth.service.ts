import { compare } from 'bcryptjs';
import HttpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import {
    RefreshTokenRequest,
    UserLoginRequest,
    UserSignupRequest
} from '../../api/rest/v1/controllers/Auth/Auth.types';
import { config } from '../../config/config';
import Influencer from '../../db/entities/influencerRelated/Influencer';
import User from '../../db/entities/userRelated/User';
import { CustomError } from '../../util/CustomError';
import { UserService } from './User.service';

@Service()
export class AuthService {
  private dataSource: DataSource;

  private userService: UserService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.userService = Container.get(UserService);
  }

  isEmailUnique = async (email: string): Promise<boolean> => {
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

  userSignup = async (body: UserSignupRequest): Promise<void> => {
    const isEmailUnique = await this.isEmailUnique(body.email);
    if (!isEmailUnique) {
      throw new CustomError('Email already exists', HttpStatus.CONFLICT, {
        email: body.email,
      });
    }

    const isUsernameUnique = await this.isUsernameUnique(body.username);
    if (!isUsernameUnique) {
      throw new CustomError('Username already exists', HttpStatus.CONFLICT, {
        username: body.username,
      });
    }
    try {
      await this.userService.createUser(body);
    } catch (err) {
      throw new CustomError('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR, {
        err,
      });
    }
  };

  createToken = (id: string, email: string): string => {
    const token = jwt.sign({ id, email }, config.jwtKey as string, {
      expiresIn: '1h',
    });

    return token;
  };

  userLogin = async (body: UserLoginRequest): Promise<{ token: string; email: string }> => {
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { email: body.email } });

    if (!user) {
      throw new CustomError('A user with that email does not exist', HttpStatus.UNAUTHORIZED, {
        email: body.email,
      });
    }
    const isPasswordValid = await compare(body.password, user.password as string);

    if (!isPasswordValid) {
      throw new CustomError('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    return {
      token: this.createToken(user.id as string, user.email as string),
      email: user.email as string,
    };
  };

  userRefreshToken = async (
    body: RefreshTokenRequest
  ): Promise<{ token: string; email: string }> => {
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { id: body.id, email: body.email } });

    if (!user) {
      throw new CustomError(
        'A user with that id and email does not exist',
        HttpStatus.UNAUTHORIZED
      );
    }

    return {
      token: this.createToken(user.id as string, user.email as string),
      email: user.email as string,
    };
  };

  influencerSignup = async () => {
    console.log('Signup influencer');
  };

  influencerLogin = async () => {
    console.log('Login influencer');
  };
}
