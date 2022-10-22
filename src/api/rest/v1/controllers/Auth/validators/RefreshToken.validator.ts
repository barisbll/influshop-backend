import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { RefreshTokenRequest } from '../Auth.type';

export const refreshTokenValidator = async (refreshTokenRequest: RefreshTokenRequest) => {
  const schema = yup.object().shape({
    id: yup.string().uuid().required(),
    email: yup.string().email().required(),
  });

  try {
    return await schema.validate(refreshTokenRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};
