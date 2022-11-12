import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { StarCreateRequest } from '../Star.type';

export const starCreateValidator = async (
    starCreateRequest: StarCreateRequest,
) => {
  const schema = yup.object().shape({
    itemId: yup.string().uuid().required(),
    stars: yup.number().min(1).max(5).required(),
  });

  try {
    return await schema.validate(starCreateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};
