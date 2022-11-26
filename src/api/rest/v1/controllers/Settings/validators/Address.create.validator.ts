import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { AddressCreateRequest } from '../Settings.type';

export const addressCreateValidator = async (addressCreateRequest: AddressCreateRequest) => {
  const schema = yup.object().shape({
    addressName: yup.string().required(),
    address: yup.string().optional(),
    country: yup.string().required(),
    state: yup.string().optional(),
    city: yup.string().required(),
    street: yup.string().required(),
    zip: yup.string().required(),
  });

  try {
    return await schema.validate(addressCreateRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};
