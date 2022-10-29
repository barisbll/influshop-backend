import { compare } from 'bcryptjs';
import HttpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { Container, Service } from 'typedi';
import { DataSource } from 'typeorm';
import {
  LoginRequest,
  RefreshTokenRequest,
  SignupRequest,
} from '../api/rest/v1/controllers/Auth/Auth.type';
import { config } from '../config/config';
import Admin from '../db/entities/adminRelated/Admin';
import Influencer from '../db/entities/influencerRelated/Influencer';
import User from '../db/entities/userRelated/User';
import { CustomError } from '../util/CustomError';
import { AdminService } from './Admin.service';
import { InfluencerService } from './Influencer.service';
import { UserService } from './User.service';

@Service()
export class AuthService {
  private dataSource: DataSource;

  private userService: UserService;
  private influencerService: InfluencerService;
  private adminService: AdminService;

  constructor() {
    this.dataSource = Container.get('dataSource');
    this.userService = Container.get(UserService);
    this.influencerService = Container.get(InfluencerService);
    this.adminService = Container.get(AdminService);
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

  userSignup = async (body: SignupRequest): Promise<void> => {
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
      expiresIn: '24h',
    });

    return token;
  };

  userLogin = async (body: LoginRequest): Promise<{ token: string; email: string }> => {
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
    body: RefreshTokenRequest,
  ): Promise<{ token: string; email: string }> => {
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { id: body.id, email: body.email } });

    if (!user) {
      throw new CustomError(
        'A user with that id and email does not exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      token: this.createToken(user.id as string, user.email as string),
      email: user.email as string,
    };
  };

  influencerSignup = async (body: SignupRequest): Promise<void> => {
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
      await this.influencerService.createInfluencer(body);
    } catch (err) {
      throw new CustomError('Error creating influencer', HttpStatus.INTERNAL_SERVER_ERROR, {
        err,
      });
    }
  };

  influencerLogin = async (body: LoginRequest): Promise<{ token: string; email: string }> => {
    const influencer = await this.dataSource
      .getRepository(Influencer)
      .findOne({ where: { email: body.email } });

    if (!influencer) {
      throw new CustomError(
        'An influencer with that email does not exist',
        HttpStatus.UNAUTHORIZED,
        {
          email: body.email,
        },
      );
    }
    const isPasswordValid = await compare(body.password, influencer.password as string);

    if (!isPasswordValid) {
      throw new CustomError('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    return {
      token: this.createToken(influencer.id as string, influencer.email as string),
      email: influencer.email as string,
    };
  };

  influencerRefreshToken = async (
    body: RefreshTokenRequest,
  ): Promise<{ token: string; email: string }> => {
    const influencer = await this.dataSource
      .getRepository(Influencer)
      .findOne({ where: { id: body.id, email: body.email } });

    if (!influencer) {
      throw new CustomError(
        'An influencer with that id and email does not exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      token: this.createToken(influencer.id as string, influencer.email as string),
      email: influencer.email as string,
    };
  };

  adminLogin = async (
    body: LoginRequest,
  ): Promise<{ token: string; email: string; isRoot: boolean }> => {
    if (body.email === config.rootAdminEmail && body.password === config.rootAdminPassword) {
      return {
        token: this.createToken('root', body.email),
        email: body.email,
        isRoot: true,
      };
    }

    const admin = await this.dataSource
      .getRepository(Admin)
      .findOne({ where: { email: body.email } });

    if (!admin) {
      throw new CustomError('An admin with that email does not exist', HttpStatus.UNAUTHORIZED, {
        email: body.email,
      });
    }
    const isPasswordValid = await compare(body.password, admin.password as string);

    if (!isPasswordValid) {
      throw new CustomError('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    return {
      token: this.createToken(admin.id as string, admin.email as string),
      email: admin.email as string,
      isRoot: false,
    };
  };

  adminSignup = async (body: SignupRequest): Promise<void> => {
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
      await this.adminService.createAdmin(body);
    } catch (err) {
      throw new CustomError('Error creating admin', HttpStatus.INTERNAL_SERVER_ERROR, {
        err,
      });
    }
  };

  adminRefreshToken = async (
    body: RefreshTokenRequest,
  ): Promise<{ token: string; email: string }> => {
    const admin = await this.dataSource
      .getRepository(Admin)
      .findOne({ where: { id: body.id, email: body.email } });

    if (!admin) {
      throw new CustomError(
        'An admin with that id and email does not exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      token: this.createToken(admin.id as string, admin.email as string),
      email: admin.email as string,
    };
  };
}
