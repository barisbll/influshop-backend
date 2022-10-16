import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { LoginRequest } from '../Auth.types';

export const loginValidator = async (loginRequest: LoginRequest) => {
  const schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string()
    .min(8)
    .max(20)
    .required(),
  });

  try {
    return await schema.validate(loginRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};
