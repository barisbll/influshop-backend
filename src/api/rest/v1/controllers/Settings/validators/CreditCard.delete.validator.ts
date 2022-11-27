import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';

export const creditCardDeleteValidator = async (
    creditCardDeleteRequest: {creditCardId: string},
) => {
  const schema = yup.object().shape({
    creditCardId: yup.string().uuid().required(),
  });

  try {
    return await schema.validate(creditCardDeleteRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};
