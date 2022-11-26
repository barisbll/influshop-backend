import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { AddressUpdateRequest } from '../Settings.type';

export const addressUpdateValidator = async (
  addressUpdateRequest: AddressUpdateRequest,
) => {
  const schema = yup.object().shape({
    id: yup.string().required(),
    addressName: yup.string().optional(),
    address: yup.string().optional(),
    country: yup.string().optional(),
    state: yup.string().optional(),
    city: yup.string().optional(),
    street: yup.string().optional(),
    zip: yup.string().optional(),
  });

  try {
    return await schema.validate(addressUpdateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};
