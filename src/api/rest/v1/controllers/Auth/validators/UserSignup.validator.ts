import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { SignupRequest } from '../Auth.types';

export const signupValidator = async (signupRequest: SignupRequest) => {
  const schema = yup.object().shape({
    username: yup.string().required()
    .min(4)
    .max(20),
    email: yup.string().email().required(),
    password: yup.string()
    .min(8)
    .max(20)
    .required(),
  });

  try {
    return await schema.validate(signupRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};
