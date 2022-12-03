import express from 'express';
import Container from 'typedi';
import { SearchController } from '../controllers/Search/Search.controller';

export const createRouter = () => {
  const searchController = Container.get(SearchController);

  const router = express.Router();

  router.get('/influencer', searchController.searchInfluencer);

  router.get('/item', searchController.searchItem);

  return router;
};
