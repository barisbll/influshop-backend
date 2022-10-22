import { NextFunction, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { Service } from 'typedi';
import { ExtendedRequest } from '../../../../../middleware/is-auth';
import { AuthService } from '../../../../../service/Auth.service';
import { LoginRequest, RefreshTokenRequest, SignupRequest } from './Auth.type';
import { refreshTokenValidator } from './validators/RefreshToken.validator';
import { loginValidator } from './validators/UserLogin.validator';
import { signupValidator } from './validators/UserSignup.validator';

@Service()
export class AuthController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly authService: AuthService) {}

  userSignup = async (req: Request, res: Response, next: NextFunction) => {
    req.body as SignupRequest;
    try {
      const validatedBody = await signupValidator(req.body);
      await this.authService.userSignup(validatedBody);
      res.json({ message: 'User Successfully Created' }).status(HttpStatus.CREATED);
    } catch (err) {
      next(err);
    }
  };

  userLogin = async (req: Request, res: Response, next: NextFunction) => {
    req.body as LoginRequest;
    try {
      const validateBody = await loginValidator(req.body);
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

  influencerSignup = async (req: Request, res: Response, next:NextFunction) => {
    req.body as SignupRequest;
    try {
      const validatedBody = await signupValidator(req.body);
      await this.authService.influencerSignup(validatedBody);
      res.json({ message: 'Influencer Successfully Created' }).status(HttpStatus.CREATED);
    } catch (err) {
      next(err);
    }
  };

  influencerLogin = async (req: Request, res: Response, next:NextFunction) => {
    req.body as LoginRequest;
    try {
      const validateBody = await loginValidator(req.body);
      const { token, email } = await this.authService.influencerLogin(validateBody);
      res.json({ message: 'Influencer Successfully Logged In', token, email }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
};

  influencerRefreshToken = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const { decodedToken } = req;

    try {
      const validateBody = await refreshTokenValidator(
        decodedToken as unknown as RefreshTokenRequest,
      );
      const { token, email } = await this.authService.influencerRefreshToken(validateBody);
      res.json({ message: 'Token Successfully Refreshed', token, email }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  adminSignup = async (req: Request, res: Response, next:NextFunction) => {
    req.body as SignupRequest;
    try {
      const validatedBody = await signupValidator(req.body);
      await this.authService.adminSignup(validatedBody);
      res.json({ message: 'Admin Successfully Created' }).status(HttpStatus.CREATED);
    } catch (err) {
      next(err);
    }
  };

  adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    req.body as LoginRequest;
    try {
      const validateBody = await loginValidator(req.body);
      const { token, email, isRoot } = await this.authService.adminLogin(validateBody);
      res.json({ message: 'Admin Successfully Logged In', token, email, isRoot }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  adminRefreshToken = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const { decodedToken } = req;

    try {
      const validateBody = await refreshTokenValidator(
        decodedToken as unknown as RefreshTokenRequest,
      );
      const { token, email } = await this.authService.adminRefreshToken(validateBody);
      res.json({ message: 'Token Successfully Refreshed', token, email }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };
}
