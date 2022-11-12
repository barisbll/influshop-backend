import { NextFunction, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { Service } from 'typedi';
import { ExtendedRequest } from '../../../../../middleware/is-auth';
import { StarService } from '../../../../../service/Star/Star.service';
import { RefreshTokenRequest } from '../Auth/Auth.type';
import { StarCreateRequest } from './Star.type';
import { starCreateValidator } from './validators/Star.create.validator';

@Service()
export class StarController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly starService: StarService) {}

  starCreate = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.decodedToken as RefreshTokenRequest;
    const starCreateRequest = req.body as StarCreateRequest;

    try {
      const validatedBody = await starCreateValidator(starCreateRequest);
      const star = await this.starService.starCreate(
        validatedBody,
        decodedToken,
      );
      res.json({ message: 'Star Successfully Created', star }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };
}
