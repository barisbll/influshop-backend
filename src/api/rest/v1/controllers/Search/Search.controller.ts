import { Service } from 'typedi';
import { Request, NextFunction, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { InfluencerSearchRequest } from './Search.types';
import { influencerSearchValidator } from './validators/Influencer.search.validator';
import { SearchService } from '../../../../../service/Search/Search.service';

@Service()
export class SearchController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly searchService: SearchService) {}

  searchInfluencer = async (req: Request, res: Response, next: NextFunction) => {
    const influencerSearchRequest = req.query as unknown as InfluencerSearchRequest;

    try {
      const validatedBody = await influencerSearchValidator(influencerSearchRequest);
      const result = await this.searchService.searchInfluencer(validatedBody);
      res.json({ message: 'Search Successfully Completed', result }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };

  searchItem = async (req: Request, res: Response, next: NextFunction) => {
    const itemSearchRequest = req.query as unknown as InfluencerSearchRequest;

    try {
      const validatedBody = await influencerSearchValidator(itemSearchRequest);
      const result = await this.searchService.searchItem(validatedBody);
      res.json({ message: 'Search Successfully Completed', result }).status(HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  };
}
