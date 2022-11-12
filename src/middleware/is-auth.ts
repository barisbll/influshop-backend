import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/config';
import { CustomError } from '../util/CustomError';

export interface Token extends JwtPayload {
  email: string;
  id: string;
  iat: number;
  exp: number;
}

export interface ExtendedRequest extends Request {
  decodedToken?: Token;
}

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get('Authorization');

  try {
    if (!authHeader) {
      throw new CustomError('Not authenticated', 401);
    }

    const token = authHeader.split(' ')[1];

    const decodedToken: Token = jwt.verify(token, config.jwtKey) as Token;

    if (!decodedToken) {
      throw new CustomError('Not authenticated', 401);
    }

    (req as ExtendedRequest).decodedToken = decodedToken;

    next();
  } catch (err) {
    next(err);
  }
};

// eslint-disable-next-line consistent-return
export const optionalIsAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get('Authorization') as string;
  try {
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    const decodedToken: Token = jwt.verify(token, config.jwtKey) as Token;

    if (!decodedToken) {
      throw new CustomError('Not authenticated', 401);
    }

    (req as ExtendedRequest).decodedToken = decodedToken;

    next();
  } catch (err) {
    next(err);
  }
};
