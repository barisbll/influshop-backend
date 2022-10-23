import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';

export const itemsGetValidator = async (
    itemsGetRequest: {influencerName: string},
) => {
  const schema = yup.object().shape({
    influencerName: yup.string().min(4).max(20).required(),
  });

  try {
    return await schema.validate(itemsGetRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};
