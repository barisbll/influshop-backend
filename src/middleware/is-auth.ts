import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/config';
import { CustomError } from '../util/CustomError';

interface Token extends JwtPayload {
  email: string;
  id: string;
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