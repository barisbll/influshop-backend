import { NextFunction, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { Service } from 'typedi';
import { ExtendedRequest } from '../../../../../middleware/is-auth';
import { AuthService } from '../../../../../service/Auth/Auth.service';
import { RefreshTokenRequest, UserLoginRequest, UserSignupRequest } from './Auth.types';
import { userLoginValidator } from './validators/UserLogin.validator';
import { refreshTokenValidator } from './validators/UserRefreshToken.validator';
import { userSignupValidator } from './validators/UserSignup.validator';

@Service()
export class AuthController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly authService: AuthService) {}

  userSignup = async (req: Request, res: Response, next: NextFunction) => {
    req.body as UserSignupRequest;
    try {
      const validatedBody = await userSignupValidator(req.body);
      await this.authService.userSignup(validatedBody);
      res.json({ message: 'User Successfully Created' }).status(HttpStatus.CREATED);
    } catch (err) {
      next(err);
    }
  };

  userLogin = async (req: Request, res: Response, next: NextFunction) => {
    req.body as UserLoginRequest;
    try {
      const validateBody = await userLoginValidator(req.body);
      const { token, email } = await this.authService.userLogin(validateBody);
      res.json({ message: 'User Successfully Logged In', token, email }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  userRefreshToken = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const { decodedToken } = req;

    try {
      const validateBody = await refreshTokenValidator(
        decodedToken as unknown as RefreshTokenRequest,
      );
      const { token, email } = await this.authService.userRefreshToken(validateBody);
      res.json({ message: 'Token Successfully Refreshed', token, email }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  // logoutUser = async (req: Request, res: Response, next:NextFunction) => {
  // };

  // signupInfluencer = async (req: Request, res: Response, next:NextFunction) => {
  // };

  // loginInfluencer = async (req: Request, res: Response, next:NextFunction) => {
  // };

  // logoutInfluencer = async (req: Request, res: Response, next:NextFunction) => {
  // };
}
