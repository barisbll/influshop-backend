import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';

export const realNameCreateValidator = async (realNameCreateRequest: { realName: string }) => {
  const schema = yup.object().shape({
    realName: yup.string().required(),
  });

  try {
    return await schema.validate(realNameCreateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};
