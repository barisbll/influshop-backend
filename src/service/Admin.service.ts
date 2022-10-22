import { hash } from 'bcryptjs';
import { Container, Inject, Service } from 'typedi';
import { DataSource } from 'typeorm';
import { SignupRequest } from '../api/rest/v1/controllers/Auth/Auth.types';
import Admin from '../db/entities/adminRelated/Admin';

@Service()
export class AdminService {
  @Inject('dataSource')
  private dataSource: DataSource;

  constructor() {
    this.dataSource = Container.get('dataSource');
  }

  createAdmin = async (req: SignupRequest) => {
    const admin = new Admin();
    admin.password = await hash(req.password, 12);
    admin.username = req.username;
    admin.email = req.email;

    await this.dataSource.manager.save(admin);
};
}
