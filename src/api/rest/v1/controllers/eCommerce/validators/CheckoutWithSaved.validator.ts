import HttpStatus from 'http-status-codes';
import * as yup from 'yup';
import logger from '../../../../../../config/logger';
import { CustomError } from '../../../../../../util/CustomError';
import { CheckoutWithSavedRequest } from '../eCommerce.type';

export const checkoutWithSavedValidator = async (
    checkoutWithSavedRequest: CheckoutWithSavedRequest,
) => {
  const schema = yup.object().shape({
    creditCardId: yup.string().uuid().required(),
    shippingAddress: yup.object().shape({
      addressName: yup.string().required(),
      address: yup.string().optional(),
      country: yup.string().required(),
      state: yup.string().optional(),
      city: yup.string().required(),
      street: yup.string().required(),
      zip: yup.string().required(),
    }).required(),
  });

  try {
    return await schema.validate(checkoutWithSavedRequest, { abortEarly: false });
  } catch (err) {
    const validationError = err as yup.ValidationError;
    logger.error(err);
    throw new CustomError(validationError.name, HttpStatus.BAD_REQUEST, {
      errors: validationError.errors,
    });
  }
};
