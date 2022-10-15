import 'reflect-metadata';
import { Container } from 'typedi';
import { DataSource, Logger } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { config } from './config';
import logger from './logger';

const dbLogger: Logger = {
  logQuery(query, parameters) {
    logger.debug('typeorm:query', { query, parameters });
  },
  logQueryError(error, query, parameters) {
    logger.error('typeorm:error', { error, query, parameters });
  },
  logQuerySlow(time, query, parameters) {
    logger.warn('typeorm:slow', { time, query, parameters });
  },
  logSchemaBuild(msg) {
    logger.info('typeorm:schema-build', { msg });
  },
  logMigration(msg) {
    logger.info('typeorm:migration', { msg });
  },
  log(level: 'log' | 'info' | 'warn', msg: string) {
    switch (level) {
      case 'log':
        logger.info('typeorm:log', { level, msg });
        break;
      case 'info':
        logger.info('typeorm:log', { level, msg });
        break;
      case 'warn':
        logger.warn('typeorm:log', { level, msg });
        break;
      default:
        break;
    }
  },
};

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  ssl: config.db.ssl,
  entities: ['src/db/entities/**/*'],
  migrations: ['src/db/migration/**/*'],
  logging: false,
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
  logger: dbLogger,
});

Container.set('dataSource', AppDataSource);
