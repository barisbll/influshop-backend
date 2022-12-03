import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { InfluencerSearchRequest } from '../Search.types';

export const influencerSearchValidator = async (
  influencerSearchRequest: InfluencerSearchRequest,
) => {
  const schema = yup.object().shape({
    query: yup.string().max(560).required(),
    page: yup.number().min(1).required(),
  });

  try {
    return await schema.validate(influencerSearchRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};
