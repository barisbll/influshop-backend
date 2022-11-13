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
  jwtKey: {
    doc: 'The encryption key for JWT',
    format: nonEmptyString('ENCRYPTION_KEY'),
    default: 'somekey',
    env: 'JWT_KEY',
  },
  rootAdminEmail: {
    doc: 'The email of the root admin',
    format: nonEmptyString('ROOT_ADMIN_EMAIL'),
    default: 'root',
    env: 'ROOT_ADMIN_EMAIL',
  },
  rootAdminPassword: {
    doc: 'The password of the root admin',
    format: nonEmptyString('ROOT_ADMIN_PASSWORD'),
    default: 'root',
    env: 'ROOT_ADMIN_PASSWORD',
  },
  adminPaginationLimit: {
    doc: 'The pagination limit for admin',
    format: 'int',
    default: 10,
    env: 'ADMIN_PAGINATION_LIMIT',
  },
  db: {
    host: {
      format: nonEmptyString('DATABASE_HOST'),
      default: '',
      env: 'DATABASE_HOST',
    },
    port: {
      env: 'DATABASE_PORT',
      format: 'port',
      default: 5432,
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
    ssl: {
      env: 'DATABASE_SSL',
      default: false,
      format: Boolean,
    },
  },
  cloudinary: {
    cloudName: {
      format: nonEmptyString('CLOUDINARY_CLOUD_NAME'),
      default: '',
      env: 'CLOUDINARY_CLOUD_NAME',
    },
    apiKey: {
      format: nonEmptyString('CLOUDINARY_API_KEY'),
      default: '',
      env: 'CLOUDINARY_API_KEY',
    },
    apiSecret: {
      format: nonEmptyString('CLOUDINARY_API_SECRET'),
      default: '',
      env: 'CLOUDINARY_API_SECRET',
    },
    itemImagesPreset: {
      format: nonEmptyString('CLOUDINARY_ITEM_IMAGES_PRESET'),
      default: 'influshop_items',
      env: 'CLOUDINARY_ITEM_IMAGES_PRESET',
    },
    commentImagesPreset: {
      format: nonEmptyString('CLOUDINARY_COMMENT_IMAGES_PRESET'),
      default: 'influshop_comments',
      env: 'CLOUDINARY_COMMENT_IMAGES_PRESET',
    },
    profileImagesPreset: {
      format: nonEmptyString('CLOUDINARY_PROFILE_IMAGES_PRESET'),
      default: 'influshop_profile_images',
      env: 'CLOUDINARY_PROFILE_IMAGES_PRESET',
    },
  },
});

// Perform validation
tempConfig.validate({ allowed: 'strict' });

export const config = tempConfig.getProperties();
