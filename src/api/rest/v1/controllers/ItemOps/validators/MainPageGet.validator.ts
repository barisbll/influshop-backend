import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';

export const mainPageGetGetValidator = async (mainPageGetRequest: { pageId: string}) => {
  const schema = yup.object().shape({
    pageId: yup.number().min(1).required(),
  });

  try {
    return await schema.validate(mainPageGetRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};
