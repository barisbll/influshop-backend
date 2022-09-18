import convict from 'convict';
import * as dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

const nonEmptyString =
  (errorName: string) =>
  (str: string): void => {
    if (!str) {
      logger.error(`Environment variable ${errorName} is not set`);
      throw new Error(`${errorName} environment variable is required`);
    }
  };

const tempConfig = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8080,
    env: 'PORT',
    arg: 'port',
  },
  db: {
    host: {
      format: nonEmptyString('DATABASE_HOST'),
      default: '',
      env: 'DATABASE_HOST',
    },
    username: {
      format: nonEmptyString('DATABASE_USERNAME'),
      default: 'postgres',
      env: 'DATABASE_USERNAME',
    },
    password: {
      format: nonEmptyString('DATABASE_PASSWORD'),
      default: 'postgres',
      env: 'DATABASE_PASSWORD',
    },
    database: {
      format: nonEmptyString('DATABASE_DATABASE'),
      default: 'influshop',
      env: 'DATABASE_DATABASE',
    },
  },
});

// Perform validation
tempConfig.validate({ allowed: 'strict' });

const config = tempConfig.getProperties();

export default config;
