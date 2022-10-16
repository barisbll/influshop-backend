import { hash } from 'bcryptjs';
import { Container, Inject, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { SignupRequest } from '../api/rest/v1/controllers/Auth/Auth.types';
import Category from '../db/entities/influencerRelated/Category';
import Influencer from '../db/entities/influencerRelated/Influencer';

@Service()
export class InfluencerService {
  @Inject('dataSource')
  private dataSource: DataSource;

  constructor() {
    this.dataSource = Container.get('dataSource');
  }

  createInfluencer = async (req: SignupRequest) => {
    const influencer = new Influencer();
    influencer.password = await hash(req.password, 12);
    influencer.username = req.username;
    influencer.email = req.email;
    await this.dataSource.manager.save(influencer);

    const category = new Category();
    category.name = 'default';
    category.influencer = influencer;
    await this.dataSource.manager.save(category);

    (influencer.categories as Category[]) = [category];
    await this.dataSource.manager.save(influencer);
  };
}
