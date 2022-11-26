import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';

export const addressDeleteValidator = async (
  addressDeleteRequest: {addressId: string},
) => {
  const schema = yup.object().shape({
    addressId: yup.string().required(),
  });

  try {
    return await schema.validate(addressDeleteRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};
